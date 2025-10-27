const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getDashboardStats, downloadOrdersCsv } = require('../controllers/adminController');

router.get('/dashboard/stats', protect, admin, getDashboardStats);
router.get('/reports/orders.csv', protect, admin, downloadOrdersCsv);

module.exports = router;
