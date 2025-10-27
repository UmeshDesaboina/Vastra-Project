const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getUsers, deleteUser } = require('../controllers/userController');

router.get('/', protect, admin, getUsers);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
