import express from 'express';
import { authMiddleware } from '../../../../middleware/authMiddleware.js';
import { authorize, adminApprovalMiddleware } from '../../../../middleware/roleMiddleware.js';
import { createCollection, generateQR, confirmPayment, getRecent, supplierLatestPending, downloadSlip } from '../controllers/supplierPaymentController.js';

const router = express.Router();

// Collector routes
router.post('/collection', authMiddleware, adminApprovalMiddleware, authorize('Collector'), createCollection);
router.get('/collection/recent', authMiddleware, authorize('Collector'), getRecent);
router.get('/collection/:transactionId/qr', authMiddleware, authorize('Collector'), generateQR);

// Supplier routes
router.get('/pending/latest', authMiddleware, authorize('Supplier'), supplierLatestPending);
router.post('/confirm', authMiddleware, authorize('Supplier'), confirmPayment);
router.get('/slip/:transactionId', authMiddleware, authorize('Supplier','Admin'), downloadSlip);

export default router;
