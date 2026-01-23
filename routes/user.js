const express = require('express');
const router = express.Router();
const { isAuthenticated, isUser } = require('../middleware/auth');

// User Dashboard
router.get('/dashboard', isAuthenticated, isUser, (req, res) => {
    res.render('user/dashboard', { user: req.session.user });
});

module.exports = router;