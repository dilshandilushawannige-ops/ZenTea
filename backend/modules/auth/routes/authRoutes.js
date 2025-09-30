import express from 'express';
import { signup, login, profile, adminListUsers, adminUpdateUser, updateMyProfile, deleteMyProfile, updateCollectorProfile, updateSupplierProfile } from '../controllers/authController.js';
import { authMiddleware } from '../../../middleware/authMiddleware.js';
import { authorize } from '../../../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', authMiddleware, profile);

// Employee profile management
router.put('/profile', authMiddleware, authorize('Employee'), updateMyProfile);
router.delete('/profile', authMiddleware, authorize('Employee'), deleteMyProfile);

// Collector profile management
router.put('/collector/profile', authMiddleware, authorize('Collector'), updateCollectorProfile);

// Supplier profile management
router.put('/supplier/profile', authMiddleware, authorize('Supplier'), updateSupplierProfile);

// Admin user management
router.get('/users', authMiddleware, authorize('Admin'), adminListUsers);
router.put('/users/:id', authMiddleware, authorize('Admin'), adminUpdateUser);

export default router;
