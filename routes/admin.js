const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Admin Dashboard
router.get('/dashboard', isAuthenticated, isAdmin, (req, res) => {
    res.render('admin/dashboard', { user: req.session.user });
});

module.exports = router;
