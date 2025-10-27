const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, createProductReview, updateProductReview, deleteProductReview } = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer storage to always write under backend/uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// Public routes
router.get('/', getProducts);

// Review routes - Must come before /:id route
router.post('/:id/reviews', protect, createProductReview);
router.put('/:id/reviews/:reviewId', protect, updateProductReview);
router.delete('/:id/reviews/:reviewId', protect, deleteProductReview);

// Product by ID - Must come after more specific routes
router.get('/:id', getProductById);

// Admin routes
router.post('/', protect, admin, upload.array('images', 5), createProduct);
router.put('/:id', protect, admin, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
