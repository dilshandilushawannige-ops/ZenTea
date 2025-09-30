import { Router } from 'express';
import {
  createOrUpdateSalary,
  getSalaryByEmployee,
  generatePayslip,
  listMyPayslips,
  listPayslipsByEmployee,
  downloadPayslip
} from './controllers/salaryController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';

const router = Router();

router.post('/', authMiddleware, authorize('Admin'), createOrUpdateSalary);
router.get('/me', authMiddleware, authorize('Employee'), getSalaryByEmployee);
router.get('/me/payslips', authMiddleware, authorize('Employee'), listMyPayslips);
router.post('/payslip', authMiddleware, authorize('Admin'), generatePayslip);
router.get('/payslip/:employeeId', authMiddleware, authorize('Admin'), listPayslipsByEmployee);
router.get('/:id/pdf', authMiddleware, downloadPayslip);

export default router;
