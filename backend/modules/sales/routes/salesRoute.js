import { Router } from 'express';
import {
  getAllSales,
  getSaleById,
  addSales,
  updateSale,
  deleteSale,
  getUserOrders,
  createOrder
} from '../controllers/salesControllers.js';
import { authMiddleware } from '../../../middleware/authMiddleware.js';

const router = Router();

router.get('/', getAllSales);
router.get('/my-orders', authMiddleware, getUserOrders);
router.get('/:id', getSaleById);
router.post('/add', addSales);
router.post('/order', authMiddleware, createOrder);
router.put('/update/:id', updateSale);
router.patch('/update/:id', updateSale);
router.delete('/delete/:id', deleteSale);

export default router;
