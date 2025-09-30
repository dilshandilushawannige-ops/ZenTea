import express from 'express';
import { protect } from '../../auth/middleware/authMiddleware.js';
import { authorize } from '../../auth/middleware/authorizationMiddleware.js';
import { 
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
    stream,
    uploadMiddleware 
} from '../controllers/inventoryController.js';

const inventoryRouter = express.Router();

// Products routes
inventoryRouter.post('/products', protect, authorize(['Admin', 'Collector']), uploadMiddleware, createProduct);
inventoryRouter.get('/products', protect, authorize(['Admin', 'Collector', 'Employee', 'Supplier', 'Customer']), getProducts);
inventoryRouter.get('/public/products', getProductsPublic);
inventoryRouter.put('/products/:id', protect, authorize(['Admin', 'Collector']), uploadMiddleware, updateProduct);
inventoryRouter.delete('/products/:id', protect, authorize(['Admin']), deleteProduct);

// Transaction routes
inventoryRouter.post('/transactions', protect, authorize(['Admin', 'Collector', 'Employee']), recordTransaction);

// Alert routes
inventoryRouter.get('/alerts', protect, authorize(['Admin', 'Collector']), getAlerts);
inventoryRouter.patch('/alerts/:id/read', protect, authorize(['Admin', 'Collector']), markAlertRead);
inventoryRouter.delete('/alerts/:id', protect, authorize(['Admin']), deleteAlert);

// Report routes
inventoryRouter.get('/reports', protect, authorize(['Admin', 'Collector']), getReport);

// Stream route
inventoryRouter.get('/stream', protect, stream);

export default inventoryRouter;
