// FILE: routes/pages.js
const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

// Fungsi helper untuk merender halaman placeholder
const renderPlaceholder = (pageKey, pageTitle) => {
    return (req, res) => {
        res.render('placeholder', {
            user: req.session.user,
            page: pageKey,       // Kunci untuk highlight sidebar (sesuai sidebar.ejs)
            pageTitle: pageTitle // Judul yang muncul di Header
        });
    };
};

// Route untuk masing-masing opsi sidebar
router.get('/profile', isAuthenticated, renderPlaceholder('profile', 'Profil Pengguna'));
router.get('/submit-jp', isAuthenticated, renderPlaceholder('submit-jp', 'Submit JP'));
router.get('/riwayat-submit', isAuthenticated, renderPlaceholder('riwayat-submit', 'Riwayat Submit'));
router.get('/pengajuan', isAuthenticated, renderPlaceholder('pengajuan', 'Pengajuan Barang'));
router.get('/riwayat-pengajuan', isAuthenticated, renderPlaceholder('riwayat-pengajuan', 'Riwayat Pengajuan'));

module.exports = router;