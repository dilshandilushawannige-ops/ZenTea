import { Router } from 'express';
import {
  getAllSales,
  getSaleById,
  addSales,
  updateSale,
  deleteSale
} from '../controllers/salesControllers.js';

const router = Router();

router.get('/', getAllSales);
router.get('/:id', getSaleById);
router.post('/add', addSales);
router.put('/update/:id', updateSale);
router.patch('/update/:id', updateSale);
router.delete('/delete/:id', deleteSale);

export default router;
