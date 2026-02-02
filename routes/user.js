const express = require('express');
const router = express.Router();
const { isAuthenticated, isUser } = require('../middleware/auth');

const userController = require('../controllers/userController');

// User Dashboard
router.get('/dashboard', isAuthenticated, isUser, (req, res) => {
    res.render('user/dashboard', { user: req.session.user });
});

// Update Profile
router.post('/profile/update', isAuthenticated, isUser, userController.updateProfile);

// Change Password
router.post('/profile/change-password', isAuthenticated, isUser, userController.changePassword);

module.exports = router;