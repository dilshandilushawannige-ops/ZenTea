import mongoose from 'mongoose';
import Sales from '../models/salesModel.js';

export const getAllSales = async (req, res) => {
  try {
    const sales = await Sales.find().sort({ createdAt: -1 });
    if (!sales.length) {
      return res.status(404).json({ message: 'No sales found' });
    }
    res.status(200).json({ sales });
  } catch (err) {
    console.error('getAllSales error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get user's orders only
export const getUserOrders = async (req, res) => {
  try {
    console.log('getUserOrders called');
    console.log('req.user:', req.user);
    
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    console.log('userId:', userId);
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const orders = await Sales.find({ userId }).sort({ createdAt: -1 });
    console.log('Found orders:', orders.length);
    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error('getUserOrders error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getSaleById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID' });
  }

  try {
    const sale = await Sales.findById(id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.status(200).json({ sale });
  } catch (err) {
    console.error('getSaleById error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const addSales = async (req, res) => {
  const { customerName, customerEmail, phoneNumber, address, quantity, description, status } = req.body;

  if (!customerName || !customerEmail || !phoneNumber || !address || quantity === undefined || !description) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const sale = new Sales({
      customerName,
      customerEmail,
      phoneNumber,
      address,
      quantity,
      description,
      status
    });

    await sale.save();
    res.status(201).json({ sale });
  } catch (err) {
    console.error('addSales error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create order from checkout
export const createOrder = async (req, res) => {
  try {
    console.log('createOrder called');
    console.log('req.user:', req.user);
    console.log('req.body:', req.body);
    
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    console.log('userId:', userId);
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { 
      shippingInfo, 
      items, 
      subtotal, 
      shippingCost, 
      total 
    } = req.body;

    console.log('Order data:', { shippingInfo, items, subtotal, shippingCost, total });

    if (!shippingInfo || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Missing required order information' });
    }

    const order = new Sales({
      userId,
      customerName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
      customerEmail: req.user?.email || shippingInfo.email || '',
      phoneNumber: shippingInfo.phone,
      address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}`,
      items,
      subtotal,
      shippingCost,
      total,
      shippingAddress: shippingInfo,
      status: 'Processing'
    });

    console.log('Saving order:', order);
    const savedOrder = await order.save();
    console.log('Order saved successfully:', savedOrder._id);
    
    res.status(201).json({ success: true, order: savedOrder });
  } catch (err) {
    console.error('createOrder error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const updateSale = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID' });
  }

  const updateData = req.body;
  try {
    const updated = await Sales.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
    if (!updated) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.status(200).json({ sale: updated });
  } catch (err) {
    console.error('updateSale error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const deleteSale = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID' });
  }

  try {
    const deleted = await Sales.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.status(200).json({ message: 'Sale deleted', sale: deleted });
  } catch (err) {
    console.error('deleteSale error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
