import Product from '../models/Product.js';
import Transaction, { generateTransactionId } from '../models/Transaction.js';
import Alert from '../models/Alert.js';
import { generateInventoryPDF } from '../utils/pdfGenerator.js';
import EventEmitter from 'events';
import multer from 'multer';
import path from 'path';

// ----------------- Multer (Image Upload) -----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });
const uploadMiddleware = upload.single('image');

// ----------------- Event Emitter -----------------
class InventoryEmitter extends EventEmitter {}
const inventoryEmitter = new InventoryEmitter();
let legacyTransactionIdBackfillPromise = null;

async function ensureLegacyTransactionIds() {
  if (!legacyTransactionIdBackfillPromise) {
    legacyTransactionIdBackfillPromise = (async () => {
      try {
        const legacyDocs = await Transaction.find(
          { $or: [{ transactionId: { $exists: false } }, { transactionId: null }] },
          { _id: 1 }
        ).lean();
        if (!legacyDocs.length) return;
        const ops = legacyDocs.map((doc) => ({
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: { transactionId: generateTransactionId() } }
          }
        }));
        if (ops.length) await Transaction.bulkWrite(ops, { ordered: false });
      } catch (err) {
        console.error('Failed to backfill legacy transaction IDs:', err.message);
      }
    })();
  }
  return legacyTransactionIdBackfillPromise;
}
function broadcast(event, payload) {
  inventoryEmitter.emit('broadcast', { event, payload });
}

// ----------------- Scheduled Expiry Check -----------------
const ONE_DAY = 24 * 60 * 60 * 1000;
setInterval(async () => {
  try {
    await checkExpiryAndGenerateAlerts();
  } catch (e) {
    console.error('Expiry check failed:', e.message);
  }
}, ONE_DAY);

// ----------------- CRUD -----------------
async function createProduct(req, res, next) {
  try {
    const data = req.body;
    if (req.file) data.image = `/uploads/${req.file.filename}`;
    const product = await Product.create(data);
    await evaluateProductAlerts(product);
    broadcast('product:created', product);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    // ✅ Handle duplicate batch number gracefully
    if (err.code === 11000 && err.keyPattern && err.keyPattern.batchNo) {
      return res
        .status(400)
        .json({ success: false, message: 'Batch No must be unique' });
    }
    next(err);
  }
}

async function getProducts(req, res, next) {
  try {
    const { search, category, status, sort = 'createdAt:desc' } = req.query;
    const q = {};
    if (search) q.name = { $regex: search, $options: 'i' };
    if (category) q.category = category;

    let products = await Product.find(q)
      .sort({ [sort.split(':')[0]]: sort.endsWith('desc') ? -1 : 1 })
      .lean();

    const now = new Date();
    products = products.map((p) => {
      const exp = new Date(p.expiryDate);
      let s = 'OK';
      if (exp <= now) s = 'EXPIRED';
      else {
        const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
        const near = diff <= 14;
        const low = p.stock < p.minStock;
        s = low && near
          ? 'LOW_STOCK_NEAR_EXPIRY'
          : low
          ? 'LOW_STOCK'
          : near
          ? 'NEAR_EXPIRY'
          : 'OK';
      }
      return { ...p, status: s };
    });

    if (status) products = products.filter((p) => p.status === status);

    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
}

// Public list of products (no auth) for Shop page
async function getProductsPublic(req, res, next) {
  try {
    const { search, category, status, sort = 'createdAt:desc' } = req.query;
    const q = {};
    if (search) q.name = { $regex: search, $options: 'i' };
    if (category) q.category = category;

    let products = await Product.find(q)
      .sort({ [sort.split(':')[0]]: sort.endsWith('desc') ? -1 : 1 })
      .lean();

    const now = new Date();
    products = products.map((p) => {
      const exp = new Date(p.expiryDate);
      let s = 'OK';
      if (exp <= now) s = 'EXPIRED';
      else {
        const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
        const near = diff <= 14;
        const low = p.stock < p.minStock;
        s = low && near
          ? 'LOW_STOCK_NEAR_EXPIRY'
          : low
          ? 'LOW_STOCK'
          : near
          ? 'NEAR_EXPIRY'
          : 'OK';
      }
      return { ...p, status: s };
    });

    if (status) products = products.filter((p) => p.status === status);

    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const data = req.body;
    if (req.file) data.image = `/uploads/${req.file.filename}`;
    const product = await Product.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true
    });
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });

    await evaluateProductAlerts(product);
    broadcast('product:updated', product);
    res.json({ success: true, data: product });
  } catch (err) {
    // ✅ Handle duplicate batch number gracefully
    if (err.code === 11000 && err.keyPattern && err.keyPattern.batchNo) {
      return res
        .status(400)
        .json({ success: false, message: 'Batch No must be unique' });
    }
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });

    broadcast('product:deleted', { _id: product._id });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
}

// ----------------- Transactions -----------------
async function recordTransaction(req, res, next) {
  try {
    const { productId, type, quantity, reason, note, batchNumber } = req.body;
    const product = await Product.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });

    const qty = parseInt(quantity, 10);
    if (!Number.isInteger(qty) || qty <= 0)
      return res
        .status(400)
        .json({ success: false, message: 'Quantity must be a positive integer' });

    if (type === 'IN') product.stock += qty;
    else if (type === 'OUT') {
      if (product.stock - qty < 0)
        return res
          .status(400)
          .json({ success: false, message: 'Insufficient stock' });
      product.stock -= qty;
    } else
      return res
        .status(400)
        .json({ success: false, message: 'Invalid transaction type' });

    await product.save();
    await ensureLegacyTransactionIds();

    const createdBy = (req.user && (req.user.name || req.user.email)) || 'system';
    const baseTxPayload = {
      product: product._id,
      type,
      quantity: qty,
      reason,
      note,
      batchNumber: batchNumber || '',
      createdBy
    };

    let tx;
    try {
      tx = await Transaction.create(baseTxPayload);
    } catch (txErr) {
      if (txErr.code === 11000 && txErr.keyPattern && txErr.keyPattern.transactionId) {
        tx = await Transaction.create({ ...baseTxPayload, transactionId: generateTransactionId() });
      } else {
        throw txErr;
      }
    }

    await evaluateProductAlerts(product);
    broadcast('transaction:created', { transaction: tx, product });
    broadcast('product:updated', product);

    res.status(201).json({ success: true, data: { transaction: tx, product } });
  } catch (err) {
    next(err);
  }
}

// ----------------- Alerts -----------------
async function getAlerts(req, res, next) {
  try {
    const alerts = await Alert.find()
      .sort({ createdAt: -1 })
      .populate('product', 'name category stock minStock expiryDate')
      .lean();
    res.json({ success: true, data: alerts });
  } catch (err) {
    next(err);
  }
}

async function markAlertRead(req, res, next) {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!alert)
      return res
        .status(404)
        .json({ success: false, message: 'Alert not found' });

    res.json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
}

async function deleteAlert(req, res, next) {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert)
      return res
        .status(404)
        .json({ success: false, message: 'Alert not found' });
    res.json({ success: true, message: 'Alert deleted' });
  } catch (err) {
    next(err);
  }
}

// ----------------- Helper: Alerts -----------------
async function evaluateProductAlerts(product) {
  const now = new Date();
  await Alert.deleteMany({ product: product._id, type: { $ne: 'EXPIRED' } });

  const low = product.stock < product.minStock;
  if (low) {
    const a = await Alert.create({
      product: product._id,
      type: 'LOW_STOCK',
      message: `${product.name} is below minimum stock (${product.stock} < ${product.minStock})`
    });
    broadcast(
      'alert:new',
      await Alert.findById(a._id)
        .populate('product', 'name category stock minStock expiryDate')
        .lean()
    );
  }

  if (product.expiryDate <= now) {
    const a = await Alert.findOneAndUpdate(
      { product: product._id, type: 'EXPIRED' },
      {
        message: `${product.name} is expired on ${new Date(
          product.expiryDate
        ).toLocaleDateString()}`
      },
      { new: true, upsert: true }
    );
    broadcast(
      'alert:new',
      await Alert.findById(a._id)
        .populate('product', 'name category stock minStock expiryDate')
        .lean()
    );
  } else {
    const diffDays = Math.ceil((product.expiryDate - now) / (1000 * 60 * 60 * 24));
    if (diffDays <= 14) {
      const a = await Alert.create({
        product: product._id,
        type: 'NEAR_EXPIRY',
        message: `${product.name} is near expiry in ${diffDays} day(s)`
      });
      broadcast(
        'alert:new',
        await Alert.findById(a._id)
          .populate('product', 'name category stock minStock expiryDate')
          .lean()
      );
    }
  }
}

async function checkExpiryAndGenerateAlerts() {
  const products = await Product.find();
  for (const p of products) {
    await evaluateProductAlerts(p);
  }
}

// ----------------- Reports -----------------
async function getReport(req, res, next) {
  try {
    const { type = 'daily', category, status } = req.query;
    const now = new Date();
    const { start, end } = getDateRange(type, now);

    const q = {};
    if (category) q.category = category;

    let products = await Product.find(q).lean();
    const now2 = new Date();
    products = products.map((p) => {
      const exp = new Date(p.expiryDate);
      let s = 'OK';
      if (exp <= now2) s = 'EXPIRED';
      else {
        const diff = Math.ceil((exp - now2) / (1000 * 60 * 60 * 24));
        const near = diff <= 14;
        const low = p.stock < p.minStock;
        s = low && near
          ? 'LOW_STOCK_NEAR_EXPIRY'
          : low
          ? 'LOW_STOCK'
          : near
          ? 'NEAR_EXPIRY'
          : 'OK';
      }
      return { ...p, status: s };
    });

    if (status) products = products.filter((p) => p.status === status);

    const rows = products.map((p) => ({
      name: p.name,
      category: p.category,
      batchNo: p.batchNo,
      stock: p.stock,
      minStock: p.minStock,
      expiryDate: p.expiryDate,
      status: p.status,
      weight: p.weight
    }));

    const totals = {
      totalProducts: products.length,
      totalStock: products.reduce((a, b) => a + b.stock, 0),
      lowStockCount: products.filter((p) => p.status.includes('LOW_STOCK'))
        .length,
      nearExpiryCount: products.filter(
        (p) => p.status === 'NEAR_EXPIRY' || p.status === 'LOW_STOCK_NEAR_EXPIRY'
      ).length
    };

    const pdfBuffer = await generateInventoryPDF({
      title: type.charAt(0).toUpperCase() + type.slice(1),
      dateRange: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
      rows,
      totals,
      generatedBy:
        (req.user && (req.user.name || req.user.email)) || 'system',
      logoPath: process.env.FACTORY_LOGO_PATH || null
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="inventory-${type}-report.pdf"`
    );
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
}

function getDateRange(type, refDate) {
  const start = new Date(refDate);
  const end = new Date(refDate);

  if (type === 'daily') {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (type === 'weekly') {
    const day = start.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    start.setDate(start.getDate() + diffToMonday);
    start.setHours(0, 0, 0, 0);
    end.setTime(start.getTime() + 6 * 24 * 60 * 60 * 1000);
    end.setHours(23, 59, 59, 999);
  } else if (type === 'monthly') {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(start.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
  }
  return { start, end };
}

// ----------------- SSE Stream -----------------
async function stream(req, res, next) {
  try {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    const onBroadcast = ({ event, payload }) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    inventoryEmitter.on('broadcast', onBroadcast);
    req.on('close', () => {
      inventoryEmitter.removeListener('broadcast', onBroadcast);
    });
  } catch (err) {
    next(err);
  }
}

// ----------------- Export All -----------------
export {
  uploadMiddleware,
  createProduct,
  getProducts,
  getProductsPublic,
  updateProduct,
  deleteProduct,
  recordTransaction,
  getAlerts,
  markAlertRead,
  deleteAlert,
  getReport,
  stream
};


