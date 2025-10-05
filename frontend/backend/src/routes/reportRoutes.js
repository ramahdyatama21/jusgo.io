const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/dashboard', authMiddleware, reportController.getDashboardStats);
router.get('/sales', authMiddleware, reportController.getSalesReport);
router.get('/products', authMiddleware, reportController.getProductReport);
router.get('/stock', authMiddleware, reportController.getStockReport);
router.get('/open-order', authMiddleware, reportController.getOpenOrderReport);

module.exports = router;