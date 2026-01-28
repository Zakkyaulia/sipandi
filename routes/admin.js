const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { User } = require('../models');
const { Op } = require('sequelize'); // Diperlukan untuk fitur pencarian
const bcrypt = require('bcryptjs');

// --- ADMIN DASHBOARD ---
router.get('/dashboard', isAuthenticated, isAdmin, async (req, res) => {
    try {
        // 1. Hitung Total ASN
        const totalUsers = await User.count({ where: { role: 'asn' } });

        // 2. Ambil 5 User ASN Terbaru (Tambahan Baru)
        const recentUsers = await User.findAll({
            where: { role: 'asn' },
            limit: 5,
            order: [['createdAt', 'DESC']]
        });
        
        res.render('admin/dashboard', { 
            user: req.session.user,
            totalUsers: totalUsers,
            recentUsers: recentUsers, // Kirim data user terbaru ke view
            page: 'dashboard'
        });
    } catch (error) {
        console.error("Error Dashboard:", error);
        res.status(500).send('Internal Server Error');
    }
});

// --- HALAMAN MANAJEMEN USER (View) ---
router.get('/users', isAuthenticated, isAdmin, (req, res) => {
    res.render('admin/users', { 
        user: req.session.user, 
        page: 'users' 
    });
});

// --- API: DATA LIST USER (Untuk Tabel) ---
router.get('/users/list', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { search, role } = req.query;
        let whereClause = {};

        // 1. Logika Pencarian (Nama atau NIP)
        if (search) {
            whereClause = {
                [Op.or]: [
                    { nama: { [Op.like]: `%${search}%` } },
                    { nip: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        // 2. Logika Filter Role
        if (role && role !== 'all') {
            whereClause.role = role;
        }

        // Ambil data dari database
        const users = await User.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });

        // Format data agar sesuai dengan userManagement.js
        const formattedUsers = users.map(u => ({
            id: u.id_user,
            name: u.nama,
            username: u.nip,
            email: '-', // Email tidak ada di database, kita kasih strip
            role: u.role,
            status: 'active' // Kita anggap semua aktif karena belum ada kolom status
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

        // Cek NIP ganda
        const existingUser = await User.findOne({ where: { nip: username } });
        if (existingUser) {
            return res.json({ success: false, message: 'NIP sudah terdaftar' });
        }

        // Hash Password
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
    // Generate password acak sederhana
    const randomPassword = Math.random().toString(36).slice(-8);
    res.json({ success: true, password: randomPassword });
});

module.exports = router;