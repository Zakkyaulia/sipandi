require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// --- IMPORT ROUTES ---
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
// REVISI: Baris userManagement dihapus karena filenya tidak ada di folder routes

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

app.use('/api', apiRoutes);

// --- ROOT REDIRECT ---
app.get('/', (req, res) => {
    if (req.session && req.session.user) {
        if (req.session.user.role === 'admin') {
            return res.redirect('/admin/dashboard');
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