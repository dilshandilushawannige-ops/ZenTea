import SupplierPayment from '../models/SupplierPayment.js';
import PaymentTransaction from '../../common/models/Transaction.js';
import { nextTxnId } from '../../common/utils/idGen.js';
import { calcTotal } from '../../common/utils/paymentCalc.js';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import User from '../../../auth/models/User.js';
import nodemailer from 'nodemailer';
import { sendSMS } from '../../../../utils/smsService.js';
import { generateReceiptPDF } from '../utils/receiptGenerator.js';

const TWO_MIN = 2 * 60; // seconds

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const notify = async ({ email, phone, message }) => {
  try {
    if (email)
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Tea Factory Payment',
        text: message,
      });
    if (phone) {
      const sent = await sendSMS(phone, message);
      if (!sent) {
        console.warn('[sms] failed to notify supplier via SMS', phone);
        console.log('SMS to', phone, ':', message);
      }
    }
  } catch (e) {
    console.warn('Notification failed', e.message);
  }
};

// Collector saves collection
export const createCollection = async (req, res, next) => {
  try {
    const { supplierId, weightKg, rate, date } = req.body;
    if (!supplierId || !weightKg || !rate)
      return res.status(400).json({ message: 'Missing required fields' });

    const weight = Number(weightKg);
    const r = Number(rate);
    if (isNaN(weight) || isNaN(r) || weight <= 0 || r <= 0)
      return res.status(400).json({ message: 'Invalid numbers' });
    if (/(.)\1{2,}/.test(String(weight)) || /(.)\1{2,}/.test(String(r)))
      return res
        .status(400)
        .json({ message: 'No repeating digits > 2 times' });

    const d = date ? new Date(date) : new Date();
    if (d.getTime() > Date.now())
      return res.status(400).json({ message: 'Date cannot be in the future' });

    const supplier = await User.findOne({
      uniqueId: supplierId,
      role: 'Supplier',
      isActive: true,
    });
    if (!supplier)
      return res.status(404).json({ message: 'Supplier not found or inactive' });

    const transactionId = nextTxnId();
    const total = calcTotal(weight, r);

    const rec = await SupplierPayment.create({
      transactionId,
      supplierId,
      collectorId: req.user.uniqueId,
      weightKg: weight,
      rate: r,
      total,
      status: 'Pending',
      date: d,
    });

    await PaymentTransaction.create({
      transactionId,
      type: 'Supplier',
      amount: total,
      meta: { supplierId, collectorId: req.user.uniqueId },
    });

    res.status(201).json({ message: 'Collection saved', data: rec });
    req.io?.emit('collection:new', {
      transactionId,
      supplierId,
      total,
      status: 'Pending',
    });
  } catch (err) {
    next(err);
  }
};

// Generate QR (stores JWT internally, QR shows transactionId)
export const generateQR = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const rec = await SupplierPayment.findOne({ transactionId });
    if (!rec) return res.status(404).json({ message: 'Transaction not found' });
    if (rec.status === 'Paid')
      return res.status(400).json({ message: 'Already paid' });

    const exp = Math.floor(Date.now() / 1000) + TWO_MIN;
    const token = jwt.sign(
      { transactionId, supplierId: rec.supplierId, exp },
      process.env.JWT_SECRET
    );

    rec.qrToken = token;
    rec.qrExp = new Date(exp * 1000);
    rec.status = 'QR Generated';
    await rec.save();

    // ✅ Only embed transactionId in QR
    const dataURL = await QRCode.toDataURL(transactionId);

    req.io?.emit('qr:generated', {
      transactionId,
      supplierId: rec.supplierId,
    });

    res.json({ dataURL, exp, transactionId });
  } catch (err) {
    next(err);
  }
};

// Supplier confirms payment (using transactionId)
export const confirmPayment = async (req, res, next) => {
  try {
    const { transactionId } = req.body;
    if (!transactionId)
      return res.status(400).json({ message: 'Missing transactionId' });

    const rec = await SupplierPayment.findOne({ transactionId });
    if (!rec) return res.status(404).json({ message: 'Transaction not found' });
    if (rec.supplierId !== req.user.uniqueId)
      return res.status(403).json({ message: 'Ownership check failed' });
    if (rec.qrExp && rec.qrExp.getTime() < Date.now())
      return res.status(400).json({ message: 'Invalid or Expired QR' });
    if (rec.status === 'Paid')
      return res.status(400).json({ message: 'Already paid' });

    // Verify stored JWT for expiry/validity
    try {
      jwt.verify(rec.qrToken, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid or Expired QR' });
    }

    const total =
      Math.round(Number(rec.weightKg) * Number(rec.rate) * 100) / 100;
    rec.total = total;
    rec.status = 'Paid';
    await rec.save();

    await PaymentTransaction.findOneAndUpdate(
      { transactionId: rec.transactionId },
      { status: 'Paid', amount: total }
    );

    // Generate PDF slip
    const outDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
    const filePath = path.join(outDir, `${rec.transactionId}.pdf`);
    const supplier = await User.findOne({ uniqueId: rec.supplierId });
    await generateReceiptPDF(filePath, {
      logoPath: path.join(process.cwd(), 'logo.png'),
      title: 'Tea Factory Payment Slip',
      supplier: {
        name: supplier.name,
        uniqueId: supplier.uniqueId,
        company: supplier.company,
      },
      collection: {
        weightKg: rec.weightKg,
        rate: rec.rate,
        total: total,
        collectorId: rec.collectorId,
        date: rec.date,
      },
      transaction: { transactionId: rec.transactionId, createdAt: rec.updatedAt },
    });

    const message = `Dear ${supplier.name}, Your payment of LKR ${total} for ${new Date(
      rec.date
    ).toLocaleDateString()} has been processed successfully. Transaction ID: ${
      rec.transactionId
    } Tea Factory Management System`;
    await notify({ email: supplier.email, phone: supplier.phone, message });

    req.io?.emit('payment:completed', {
      transactionId: rec.transactionId,
      supplierId: rec.supplierId,
      total,
    });

    res.json({
      message: 'Payment confirmed',
      pdfPath: `/files/${rec.transactionId}.pdf`,
    });
  } catch (err) {
    next(err);
  }
};

// Other unchanged functions...
export const getRecent = async (req, res, next) => {
  try {
    const list = await SupplierPayment.find({
      collectorId: req.user.uniqueId,
    })
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(list);
  } catch (err) {
    next(err);
  }
};

export const supplierLatestPending = async (req, res, next) => {
  try {
    const rec = await SupplierPayment.findOne({
      supplierId: req.user.uniqueId,
      status: { $ne: 'Paid' },
    }).sort({ createdAt: -1 });
    res.json(rec || {});
  } catch (err) {
    next(err);
  }
};

export const downloadSlip = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const file = `tmp/${transactionId}.pdf`;
    if (!fs.existsSync(file))
      return res.status(404).json({ message: 'PDF not found' });
    res.download(file);
  } catch (err) {
    next(err);
  }
};
