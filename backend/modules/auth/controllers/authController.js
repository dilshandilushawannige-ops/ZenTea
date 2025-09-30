import User from '../models/User.js';
import { nextRoleId } from '../utils/idGenerator.js';
import { signToken } from '../utils/tokens.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import {
  isSriLankaPhone,
  strongPassword,
  noTripleRepeat,
  noDigitsInName,
} from '../../../middleware/validate.js';

export const signup = async (req, res, next) => {
  try {
    const { name, email, phone, password, confirmPassword, role, company } =
      req.body;

    if (!name || !email || !phone || !password || !confirmPassword || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!noDigitsInName(name))
      return res
        .status(400)
        .json({ message: 'Name must only contain letters and spaces' });
    if (!isSriLankaPhone(phone))
      return res
        .status(400)
        .json({ message: 'Phone number must start with 07 and be 10 digits' });
    if (!noTripleRepeat(phone))
      return res.status(400).json({
        message: 'Phone number cannot have 3 or more repeating digits',
      });
    if (!strongPassword(password))
      return res.status(400).json({
        message:
          'Weak password: min 8 chars, 1 uppercase, 1 number, 1 special char',
      });
    if (password !== confirmPassword)
      return res.status(400).json({ message: 'Passwords do not match' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: 'Email is already registered' });

    const uniqueId = await nextRoleId(role, User);
    const hashed = await hashPassword(password);
    const isActive =
      role === 'Supplier' || role === 'Collector' || role === 'Employee'
        ? false
        : true;

    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      role,
      uniqueId,
      company,
      isActive,
    });

    if (req.io) {
      req.io.emit('user:new', {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        uniqueId: user.uniqueId,
        isActive: user.isActive,
        createdAt: user.createdAt,
      });
    }

    return res.status(201).json({
      message: 'Signup successful. Await approval if required.',
      user: { id: user._id, uniqueId, role, isActive },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await comparePassword(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.isActive)
      return res
        .status(403)
        .json({ message: 'Account pending admin approval' });
    const token = signToken({
      userId: user._id.toString(),
      uniqueId: user.uniqueId,
      role: user.role,
      isActive: user.isActive,
    });
    res.json({
      token,
      user: {
        id: user._id,
        uniqueId: user.uniqueId,
        role: user.role,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const profile = async (req, res, next) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user identifier' });
    }
    next(err);
  }
};

export const adminListUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const adminUpdateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive, role } = req.body;
    const user = await User.findByIdAndUpdate(
      id,
      { isActive, role },
      { new: true }
    ).select('-password');

    if (req.io) {
      req.io.emit('user:update', {
        id: user._id,
        name: user.name,
        role: user.role,
        uniqueId: user.uniqueId,
        isActive: user.isActive,
      });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

// Update employee's own profile
export const updateMyProfile = async (req, res, next) => {
  try {
    const { name, email, phone, company } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!name?.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!email?.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }
    if (!phone?.trim()) {
      return res.status(400).json({ message: 'Phone is required' });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(), 
      _id: { $ne: userId } 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        company: company?.trim() || undefined
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user is an Employee, also update salary records
    if (updatedUser.role === 'Employee') {
      try {
        // Import Salary model dynamically to avoid circular imports
        const { default: Salary } = await import('../salary/models/Salary.js');
        
        // Update salary record if it exists
        await Salary.updateOne(
          { employeeId: updatedUser.uniqueId },
          { 
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone
          }
        );
      } catch (salaryUpdateError) {
        // Log the error but don't fail the profile update
        console.error('Failed to update salary record:', salaryUpdateError);
      }
    }

    // Emit socket event if available
    if (req.io) {
      req.io.emit('user:update', {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        uniqueId: updatedUser.uniqueId,
        isActive: updatedUser.isActive,
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    next(err);
  }
};

// Delete employee's own profile
export const deleteMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow employees to delete their own profiles
    if (user.role !== 'Employee') {
      return res.status(403).json({ message: 'Only employees can delete their own profiles' });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    // Emit socket event if available
    if (req.io) {
      req.io.emit('user:delete', {
        id: userId,
        name: user.name,
        role: user.role,
        uniqueId: user.uniqueId,
      });
    }

    res.json({
      message: 'Profile deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Update collector's own profile
export const updateCollectorProfile = async (req, res, next) => {
  try {
    const { name, email, phone, address, collectionArea, company } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!name?.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!email?.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }
    if (!phone?.trim()) {
      return res.status(400).json({ message: 'Phone is required' });
    }

    // Validate name contains only letters and spaces
    if (!noDigitsInName(name.trim())) {
      return res.status(400).json({ message: 'Name must only contain letters and spaces' });
    }

    // Validate Sri Lankan phone format
    if (!isSriLankaPhone(phone.trim())) {
      return res.status(400).json({ message: 'Phone number must start with 07 and be 10 digits' });
    }

    // Validate no triple repeating digits in phone
    if (!noTripleRepeat(phone.trim())) {
      return res.status(400).json({ message: 'Phone number cannot have 3 or more repeating digits' });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(), 
      _id: { $ne: userId } 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    // Update collector profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        address: address?.trim() || undefined,
        collectionArea: collectionArea?.trim() || undefined,
        company: company?.trim() || undefined
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Collector profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating collector profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update supplier's own profile
export const updateSupplierProfile = async (req, res, next) => {
  try {
    const { name, email, phone, address, farmLocation, supplyCategory, company } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!name?.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!email?.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }
    if (!phone?.trim()) {
      return res.status(400).json({ message: 'Phone is required' });
    }

    // Validate name contains only letters and spaces
    if (!noDigitsInName(name.trim())) {
      return res.status(400).json({ message: 'Name must only contain letters and spaces' });
    }

    // Validate Sri Lankan phone format
    if (!isSriLankaPhone(phone.trim())) {
      return res.status(400).json({ message: 'Phone number must start with 07 and be 10 digits' });
    }

    // Validate no triple repeating digits in phone
    if (!noTripleRepeat(phone.trim())) {
      return res.status(400).json({ message: 'Phone number cannot have 3 or more repeating digits' });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(), 
      _id: { $ne: userId } 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    // Update supplier profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        address: address?.trim() || undefined,
        farmLocation: farmLocation?.trim() || undefined,
        supplyCategory: supplyCategory?.trim() || undefined,
        company: company?.trim() || undefined
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Supplier profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating supplier profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
