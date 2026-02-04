require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const pengajuanRoutes = require('./routes/pengajuan');
const jpRoutes = require('./routes/jp');
// Pastikan file routes/pages.js sudah dibuat sesuai saran sebelumnya
const pageRoutes = require('./routes/pages');

// --- MIDDLEWARE ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- SESSION CONFIGURATION ---
app.use(session({
    secret: process.env.SESSION_SECRET || 'sipandi_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
}));

// --- STATIC FILES ---
app.use(express.static(path.join(__dirname, 'public')));

// --- VIEW ENGINE SETUP ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- ROUTES ---
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/user', pengajuanRoutes);
app.use('/', jpRoutes);
app.use('/api', apiRoutes);

// Route untuk Placeholder (Profile, Submit JP, dll) ditangani di sini
app.use('/', pageRoutes);

// --- ROOT REDIRECT ---
app.get('/', (req, res) => {
    if (req.session && req.session.user) {
        if (req.session.user.role === 'admin') {
            return res.redirect('/admin/dashboard');
        } else if (req.session.user.role === 'admin_atk') {
            return res.redirect('/placeholder?page=admin-barang');
        } else if (req.session.user.role === 'admin_validasi_jp') {
            return res.redirect('/placeholder?page=admin-riwayat-jp');
        } else {
            return res.redirect('/user/dashboard');
        }
    }
    res.redirect('/login');
});

// --- DASHBOARD REDIRECT (GENERIC) ---
app.get('/dashboard', (req, res) => {
    if (req.session && req.session.user) {
        if (req.session.user.role === 'admin') {
            return res.redirect('/admin/dashboard');
        } else if (req.session.user.role === 'admin_atk') {
            return res.redirect('/placeholder?page=admin-barang');
        } else if (req.session.user.role === 'admin_validasi_jp') {
            return res.redirect('/placeholder?page=admin-riwayat-jp');
        } else {
            return res.redirect('/user/dashboard');
        }
    }
    res.redirect('/login');
});

// --- 404 HANDLER ---
app.use((req, res) => {
    res.status(404).send('404 - Halaman tidak ditemukan');
});

// --- ERROR HANDLER ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('500 - Terjadi kesalahan server');
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 SIPANDI Server berjalan di http://localhost:${PORT}`);
});