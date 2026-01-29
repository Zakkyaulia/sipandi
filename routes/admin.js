const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { User } = require('../models');
const { Op } = require('sequelize'); 
const bcrypt = require('bcryptjs');

// --- ADMIN DASHBOARD ---
router.get('/dashboard', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const totalUsers = await User.count({ where: { role: 'asn' } });
        const recentUsers = await User.findAll({
            where: { role: 'asn' },
            limit: 5,
            order: [['createdAt', 'DESC']]
        });
        
        res.render('admin/dashboard', { 
            user: req.session.user,
            totalUsers: totalUsers,
            recentUsers: recentUsers,
            page: 'dashboard'
        });
    } catch (error) {
        console.error("Error Dashboard:", error);
        res.status(500).send('Internal Server Error');
    }
});

// --- HALAMAN MANAJEMEN USER ---
router.get('/users', isAuthenticated, isAdmin, (req, res) => {
    res.render('admin/users', { 
        user: req.session.user, 
        page: 'users' 
    });
});

// ==========================================
// TAMBAHAN: PLACEHOLDER UNTUK FITUR BARU
// ==========================================

// 1. Route Manajemen Barang
router.get('/barang', isAuthenticated, isAdmin, (req, res) => {
    res.render('placeholder', { 
        user: req.session.user, 
        page: 'barang', // Kunci ini harus sama dengan di sidebar.ejs
        pageTitle: 'Manajemen Barang' 
    });
});

// 2. Route Riwayat Pengajuan (Versi Admin)
router.get('/riwayat-pengajuan', isAuthenticated, isAdmin, (req, res) => {
    res.render('placeholder', { 
        user: req.session.user, 
        page: 'riwayat-pengajuan-admin', // Kunci ini harus sama dengan di sidebar.ejs
        pageTitle: 'Riwayat Pengajuan Pegawai' 
    });
});

// 3. Route Riwayat JP (Versi Admin)
router.get('/riwayat-jp', isAuthenticated, isAdmin, (req, res) => {
    res.render('placeholder', { 
        user: req.session.user, 
        page: 'riwayat-jp', // Kunci ini harus sama dengan di sidebar.ejs
        pageTitle: 'Riwayat JP Pegawai' 
    });
});

// ==========================================
// AKHIR TAMBAHAN
// ==========================================

// --- API: DATA LIST USER ---
router.get('/users/list', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { search, role } = req.query;
        let whereClause = {};

        if (search) {
            whereClause = {
                [Op.or]: [
                    { nama: { [Op.like]: `%${search}%` } },
                    { nip: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        if (role && role !== 'all') {
            whereClause.role = role;
        }

        const users = await User.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });

        const formattedUsers = users.map(u => ({
            id: u.id_user,
            name: u.nama,
            username: u.nip,
            email: '-', 
            role: u.role,
            status: 'active' 
        }));

        res.json({ success: true, users: formattedUsers });
    } catch (error) {
        console.error("Error Fetch Users:", error);
        res.json({ success: false, message: 'Gagal mengambil data user' });
    }
});

// --- API: TAMBAH USER BARU ---
router.post('/users/create', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { name, username, password, role } = req.body;

        const existingUser = await User.findOne({ where: { nip: username } });
        if (existingUser) {
            return res.json({ success: false, message: 'NIP sudah terdaftar' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            nama: name,
            nip: username,
            password: hashedPassword,
            role: role || 'asn'
        });

        res.json({ success: true, message: 'User berhasil ditambahkan' });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Gagal menambah user' });
    }
});

// --- API: HAPUS USER ---
router.delete('/users/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await User.destroy({ where: { id_user: id } });
        res.json({ success: true, message: 'User berhasil dihapus' });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Gagal menghapus user' });
    }
});

// --- API: GENERATE PASSWORD ---
router.post('/users/generate-password', isAuthenticated, isAdmin, (req, res) => {
    const randomPassword = Math.random().toString(36).slice(-8);
    res.json({ success: true, password: randomPassword });
});

module.exports = router;