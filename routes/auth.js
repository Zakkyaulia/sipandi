const express = require('express');
const router = express.Router();
const passwordResetController = require('../controllers/passwordResetController');
const authController = require('../controllers/authController');

// GET Login page
router.get('/login', (req, res) => {
    // If already logged in, redirect to dashboard
    if (req.session && req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('login', { error: null, success: null });
});

// POST Login
router.post('/login', authController.login);

// GET Register page
router.get('/register', (req, res) => {
    // If already logged in, redirect to dashboard
    if (req.session && req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('register', { error: null, success: null });
});

// POST Register
router.post('/register', authController.register);

// GET Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/login');
    });
});

// --- Password Reset Routes ---
router.get('/forgot-password', passwordResetController.renderForgotPassword);
router.post('/forgot-password', passwordResetController.sendOTP);

router.get('/verify-otp', passwordResetController.renderVerifyOTP);
router.post('/verify-otp', passwordResetController.verifyOTP);

router.get('/reset-password', passwordResetController.renderResetPassword);
router.post('/reset-password', passwordResetController.resetPassword);

// --- Multi Role Routes ---
router.get('/auth/select-role', authController.renderSelectRole);
router.post('/auth/select-role', authController.selectRole);

module.exports = router;
