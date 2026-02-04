const express = require('express');
const router = express.Router();
const jpController = require('../controllers/jpController');
const multer = require('multer');
const path = require('path');

// Middleware untuk cek login
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login');
};

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/sertifikat/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'sertif-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Hanya file PDF, JPG, atau PNG yang diperbolehkan'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: fileFilter
});

// Submit JP Routes
router.get('/submit-jp', isAuthenticated, jpController.getSubmitPage);
router.post('/submit-jp/create', isAuthenticated, upload.single('file_sertif'), jpController.createSubmit);

// Riwayat Submit Routes
router.get('/riwayat-submit', isAuthenticated, jpController.getRiwayatPage);
router.get('/riwayat-submit/list', isAuthenticated, jpController.getRiwayatList);

module.exports = router;
