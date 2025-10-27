const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  createOrder,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  requestReturn,
  requestReplacement,
  updateReturnStatus,
  updateReplacementStatus,
  markOrderAsPaid,
  cancelReturn,
  cancelReplacement
} = require('../controllers/orderController');

// Admin routes (must be before generic /:id routes)
router.get('/stats', protect, admin, require('../controllers/orderController').getOrderStats);
router.get('/', protect, admin, getOrders);

// User routes
router.get('/myorders', protect, getMyOrders);
router.post('/', protect, createOrder);

// Order-specific routes (return/replacement must be before /:id)
router.post('/:id/return', protect, requestReturn);
router.delete('/:id/return', protect, cancelReturn);
router.post('/:id/replacement', protect, requestReplacement);
router.delete('/:id/replacement', protect, cancelReplacement);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/pay', protect, admin, markOrderAsPaid);
router.put('/:id/return-status', protect, admin, updateReturnStatus);
router.put('/:id/replacement-status', protect, admin, updateReplacementStatus);
router.get('/:id', protect, getOrderById);

module.exports = router;
