const express = require('express');
const router = express.Router();
const { isAuthenticated, isUser } = require('../middleware/auth');

const userController = require('../controllers/userController');

// User Dashboard - Menggunakan Controller baru
router.get('/dashboard', isAuthenticated, isUser, userController.getUserDashboard);

// Update Profile
router.post('/profile/update', isAuthenticated, isUser, userController.updateProfile);

// Change Password
router.post('/profile/change-password', isAuthenticated, isUser, userController.changePassword);

module.exports = router;