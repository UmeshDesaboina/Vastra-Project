const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner
} = require('../controllers/bannerController');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// Public
router.get('/', getBanners);

// Admin
router.post('/', protect, admin, upload.any(), createBanner);
router.put('/:id', protect, admin, upload.any(), updateBanner);
router.delete('/:id', protect, admin, deleteBanner);

module.exports = router;
