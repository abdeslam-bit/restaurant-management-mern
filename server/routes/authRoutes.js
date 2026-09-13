const express = require('express');
const router = express.Router();
const { login, getMe, getUsers, createUser, updateUser, deleteUser } = require('../controllers/authController');
const { protect, superAdminOnly } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', protect, getMe);

// User Management (Main Admin / SuperAdmin only)
router.get('/users', protect, superAdminOnly, getUsers);
router.post('/users', protect, superAdminOnly, createUser);
router.put('/users/:id', protect, superAdminOnly, updateUser);
router.delete('/users/:id', protect, superAdminOnly, deleteUser);

module.exports = router;
