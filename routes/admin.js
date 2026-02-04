const express = require('express');
const router = express.Router();

// Controllers
const adminJpController = require('../controllers/adminJpController');
const userController = require('../controllers/userController');
const inventoryController = require('../controllers/inventoryController');
const adminPengajuanController = require('../controllers/adminPengajuanController');

// Middleware - Pastikan Yang Mulia sudah memperbarui middleware/auth.js sesuai saran sebelumnya
const { 
    isAuthenticated, 
    isAdminUtama, 
    isAdminAtk, 
    isAdminJp 
} = require('../middleware/auth');

// ==========================================
// MODAL HAK AKSES & DASHBOARD
// ==========================================

// Dashboard Utama (Admin Utama)
router.get('/dashboard', isAuthenticated, isAdminUtama, userController.getDashboard);


// ==========================================
// MODUL MANAJEMEN AKUN (Admin Utama)
// ==========================================

// View Manajemen User
router.get('/users', isAuthenticated, isAdminUtama, userController.getUsersPage);

// API Manajemen User
router.get('/users/list', isAuthenticated, isAdminUtama, userController.getUsersList);
router.post('/users/create', isAuthenticated, isAdminUtama, userController.createUser);
router.put('/users/:id', isAuthenticated, isAdminUtama, userController.updateUser);
router.delete('/users/:id', isAuthenticated, isAdminUtama, userController.deleteUser);
router.post('/users/generate-password', isAuthenticated, isAdminUtama, userController.generatePassword);


// ==========================================
// MODUL DATA REFERENSI & STOK (Admin Utama & Admin ATK)
// ==========================================

// View Manajemen Barang
router.get('/inventory', isAuthenticated, isAdminAtk, inventoryController.getInventoryPage);

// API Manajemen Barang
router.get('/inventory/list', isAuthenticated, isAdminAtk, inventoryController.getInventoryList);
router.post('/inventory/create', isAuthenticated, isAdminAtk, inventoryController.createBarang);
router.put('/inventory/:id', isAuthenticated, isAdminAtk, inventoryController.updateBarang);
router.delete('/inventory/:id', isAuthenticated, isAdminAtk, inventoryController.deleteBarang);


// ==========================================
// MODUL VERIFIKASI & PERSETUJUAN (Sesuai Bagian Yang Mulia)
// ==========================================

// --- Verifikasi Pengajuan Barang (Admin ATK) ---
router.get('/pengajuan', isAuthenticated, isAdminAtk, adminPengajuanController.getPengajuanPage);
router.get('/pengajuan/list', isAuthenticated, isAdminAtk, adminPengajuanController.getPengajuanList);
router.post('/pengajuan/approve/:id', isAuthenticated, isAdminAtk, adminPengajuanController.approvePengajuan);
router.post('/pengajuan/reject/:id', isAuthenticated, isAdminAtk, adminPengajuanController.rejectPengajuan);

// --- Verifikasi Validasi JP ASN (Admin JP) ---
router.get('/jp', isAuthenticated, isAdminJp, adminJpController.getJpPage);
router.get('/jp/list', isAuthenticated, isAdminJp, adminJpController.getJpList);
router.post('/jp/approve/:id', isAuthenticated, isAdminJp, adminJpController.approveJp);
router.post('/jp/reject/:id', isAuthenticated, isAdminJp, adminJpController.rejectJp);

// ==========================================
// MODUL LAPORAN (Rekapitulasi) - Milik Yang Mulia
// ==========================================

// Laporan Pengajuan Barang (Akses: Admin Utama & Admin ATK)
router.get('/laporan/pengajuan', isAuthenticated, isAdminAtk, adminPengajuanController.getRekapPengajuan);

// Laporan Validasi JP (Akses: Admin Utama & Admin JP)
router.get('/laporan/jp', isAuthenticated, isAdminJp, adminJpController.getRekapJp);

// Laporan Stok Barang (Akses: Admin Utama & Admin ATK)
router.get('/laporan/stok', isAuthenticated, isAdminAtk, inventoryController.getInventoryList); 

// Laporan Pengguna (Akses: Admin Utama)
router.get('/laporan/users', isAuthenticated, isAdminUtama, userController.getUsersList);

router.get('/laporan', isAuthenticated, (req, res) => {
    res.render('admin/laporan', {
        user: req.session.user,
        page: 'laporan'
    });
});

module.exports = router;