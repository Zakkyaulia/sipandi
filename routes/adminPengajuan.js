const express = require('express');
const router = express.Router();
const adminPengajuanController = require('../controllers/adminPengajuanController');

// Middleware untuk cek login dan role admin
const isAdmin = (req, res, next) => {
    if (req.session && req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'admin_atk')) {
        return next();
    }
    res.redirect('/login');
};

// Pengajuan Management Routes
router.get('/pengajuan', isAdmin, adminPengajuanController.getPengajuanPage);
router.get('/pengajuan/list', isAdmin, adminPengajuanController.getPengajuanList);
router.put('/pengajuan/:id/approve', isAdmin, adminPengajuanController.approvePengajuan);
router.put('/pengajuan/:id/reject', isAdmin, adminPengajuanController.rejectPengajuan);

module.exports = router;
