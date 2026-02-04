const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../models');

// GET Login page
router.get('/login', (req, res) => {
    // If already logged in, redirect to dashboard
    if (req.session && req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('login', { error: null, success: null });
});

// POST Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Validasi NIP: Hanya 18 karakter, kecuali username adalah 'admin'
        if (username !== 'admin' && username.length !== 18) {
            return res.json({ 
                success: false, 
                message: 'NIP harus berjumlah 18 digit angka' 
            });
        }

        // Cari user berdasarkan NIP
        const user = await User.findOne({
            where: { nip: username }
        });

        if (!user) {
            return res.json({ success: false, message: 'Username atau password salah' });
        }

        // Cek password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.json({ success: false, message: 'Username atau password salah' });
        }

        // Create session
        req.session.user = {
            id_user: user.id_user,
            nama: user.nama,
            nip: user.nip,
            role: user.role,
            unit_kerja: user.unit_kerja,
            email: user.email
        };

        let redirectUrl = '/user/dashboard';
        if (user.role === 'admin') {
            redirectUrl = '/admin/dashboard';
        } else if (user.role === 'admin_atk') {
            redirectUrl = '/placeholder?page=admin-barang';
        } else if (user.role === 'admin_validasi_jp') {
            redirectUrl = '/placeholder?page=admin-riwayat-jp';
        }

        return res.json({ success: true, redirectUrl, message: 'Login berhasil' });

    } catch (error) {
        console.error('Login error:', error);
        return res.json({ success: false, message: 'Terjadi kesalahan saat login' });
    }
});

// GET Register page
router.get('/register', (req, res) => {
    // If already logged in, redirect to dashboard
    if (req.session && req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('register', { error: null, success: null });
});

// POST Register
router.post('/register', async (req, res) => {
    const { username, nip, password, confirmPassword } = req.body;

    // Validation
    if (!username || !nip || !password || !confirmPassword) {
        return res.render('register', {
            error: 'Semua field harus diisi',
            success: null
        });
    }

    // Check password match
    if (password !== confirmPassword) {
        return res.render('register', {
            error: 'Password dan Konfirmasi Password tidak sama',
            success: null
        });
    }

    // Validate NIP format (18 digits)
    if (!/^\d{18}$/.test(nip)) {
        return res.render('register', {
            error: 'NIP harus 18 digit angka',
            success: null
        });
    }

    // Validate password length
    if (password.length < 6) {
        return res.render('register', {
            error: 'Password minimal 6 karakter',
            success: null
        });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ where: { nip } });
        if (existingUser) {
            return res.render('register', {
                error: 'NIP sudah terdaftar',
                success: null
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        await User.create({
            nama: username,
            nip,
            password: hashedPassword,
            role: 'asn' // Default role is asn (ASN)
        });

        // Redirect to login with success message
        return res.render('login', {
            error: null,
            success: 'Registrasi berhasil! Silakan login dengan akun Anda.'
        });
    } catch (error) {
        console.error('Register error:', error);
        return res.render('register', {
            error: 'Terjadi kesalahan saat registrasi',
            success: null
        });
    }
});

// GET Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/login');
    });
});

module.exports = router;
