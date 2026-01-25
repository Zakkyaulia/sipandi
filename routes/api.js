const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const apiValidasiController = require('../controllers/apiValidasiController');
const { isAuthenticated } = require('../middleware/auth');

// Konfigurasi Multer (Persis seperti Kabad)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/') // Disimpan di public/uploads agar bisa diakses
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

// Route API (Dilindungi middleware Session SIPANDI)
router.get('/keaktifan', isAuthenticated, apiValidasiController.getKeaktifan);
router.post('/keaktifan/upload', isAuthenticated, upload.array('files'), apiValidasiController.uploadBukti);
router.delete('/keaktifan/:id', isAuthenticated, apiValidasiController.deleteKeaktifan);

module.exports = router;