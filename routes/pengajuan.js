const express = require('express');
const router = express.Router();
const pengajuanController = require('../controllers/pengajuanController');

// Middleware untuk cek login
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login');
};

// Katalog Routes
router.get('/katalog', isAuthenticated, pengajuanController.getKatalogPage);
router.get('/katalog/list', isAuthenticated, pengajuanController.getKatalogList);

// Pengajuan Routes
router.post('/pengajuan/create', isAuthenticated, pengajuanController.createPengajuan);

// Riwayat Routes
router.get('/riwayat-pengajuan', isAuthenticated, pengajuanController.getRiwayatPage);
router.get('/riwayat-pengajuan/list', isAuthenticated, pengajuanController.getRiwayatList);

module.exports = router;
