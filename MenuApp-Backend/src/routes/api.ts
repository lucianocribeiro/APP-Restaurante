import { Router } from 'express';
import { login } from '../controllers/authController';
import { getMenuBySlug, placeOrder, getOrderById } from '../controllers/menuController';
import { getOrders, updateOrderStatus, updateOrderPaymentStatus, getCategories, createProduct, getLocalSettings, updateLocalSettings, getAdminProducts, updateProductStock } from '../controllers/adminController';
import { getKitchens, createKitchen, deleteKitchen } from '../controllers/kitchenController';
import { getTables, createTable, deleteTable } from '../controllers/tableController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/auth/login', login);
router.get('/menu/:slug', getMenuBySlug);
router.post('/orders', placeOrder);
router.get('/orders/:id', getOrderById);

// Admin routes (Protected)
router.get('/admin/orders', authenticateToken, getOrders);
router.put('/admin/orders/:id/status', authenticateToken, updateOrderStatus);
router.put('/admin/orders/:id/payment', authenticateToken, updateOrderPaymentStatus);
router.get('/admin/categories', authenticateToken, getCategories);
router.get('/admin/products', authenticateToken, getAdminProducts);
router.post('/admin/products', authenticateToken, createProduct);
router.put('/admin/products/:id/stock', authenticateToken, updateProductStock);

// Kitchens
router.get('/admin/kitchens', authenticateToken, getKitchens);
router.post('/admin/kitchens', authenticateToken, createKitchen);
router.delete('/admin/kitchens/:id', authenticateToken, deleteKitchen);

// Table management
router.get('/admin/tables', authenticateToken, getTables);
router.post('/admin/tables', authenticateToken, createTable);
router.delete('/admin/tables/:id', authenticateToken, deleteTable);

// Local settings
router.get('/admin/local', authenticateToken, getLocalSettings);
router.put('/admin/local', authenticateToken, updateLocalSettings);

export default router;
