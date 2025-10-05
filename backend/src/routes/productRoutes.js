const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, productController.getAllProducts);
router.get('/low-stock', authMiddleware, productController.getLowStockProducts);
router.get('/:id', authMiddleware, productController.getProductById);
router.post('/', authMiddleware, adminOnly, productController.createProduct);
router.put('/:id', authMiddleware, adminOnly, productController.updateProduct);
router.delete('/:id', authMiddleware, adminOnly, productController.deleteProduct);
router.post('/import', authMiddleware, adminOnly, productController.importProducts);

module.exports = router;