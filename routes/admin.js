const express = require('express');
const router = express.Router();
const adminJpController = require('../controllers/adminJpController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const userController = require('../controllers/userController');
const inventoryController = require('../controllers/inventoryController');
const adminPengajuanController = require('../controllers/adminPengajuanController');

// --- ADMIN DASHBOARD ---
router.get('/dashboard', isAuthenticated, isAdmin, userController.getDashboard);

// --- HALAMAN MANAJEMEN USER (View) ---
router.get('/users', isAuthenticated, isAdmin, userController.getUsersPage);

// --- API: DATA LIST USER (Untuk Tabel) ---
router.get('/users/list', isAuthenticated, isAdmin, userController.getUsersList);

// --- API: TAMBAH USER BARU ---
router.post('/users/create', isAuthenticated, isAdmin, userController.createUser);

// --- API: UPDATE USER ---
router.put('/users/:id', isAuthenticated, isAdmin, userController.updateUser);

// --- API: HAPUS USER ---
router.delete('/users/:id', isAuthenticated, isAdmin, userController.deleteUser);

// --- API: GENERATE PASSWORD ---
router.post('/users/generate-password', isAuthenticated, isAdmin, userController.generatePassword);

// --- HALAMAN MANAJEMEN BARANG (View) ---
router.get('/inventory', isAuthenticated, isAdmin, inventoryController.getInventoryPage);

// --- API: DATA LIST BARANG ---
router.get('/inventory/list', isAuthenticated, isAdmin, inventoryController.getInventoryList);

// --- API: TAMBAH BARANG ---
router.post('/inventory/create', isAuthenticated, isAdmin, inventoryController.createBarang);

// --- API: UPDATE BARANG ---
router.put('/inventory/:id', isAuthenticated, isAdmin, inventoryController.updateBarang);

// --- API: HAPUS BARANG ---
router.delete('/inventory/:id', isAuthenticated, isAdmin, inventoryController.deleteBarang);

// --- HALAMAN KELOLA PENGAJUAN (View) ---
router.get('/pengajuan', isAuthenticated, isAdmin, adminPengajuanController.getPengajuanPage);

// --- API: DATA LIST PENGAJUAN ---
router.get('/pengajuan/list', isAuthenticated, isAdmin, adminPengajuanController.getPengajuanList);

// --- API: APPROVE PENGAJUAN ---
router.post('/pengajuan/approve/:id', isAuthenticated, isAdmin, adminPengajuanController.approvePengajuan);

// --- API: REJECT PENGAJUAN ---
router.post('/pengajuan/reject/:id', isAuthenticated, isAdmin, adminPengajuanController.rejectPengajuan);

// --- HALAMAN KELOLA JP (View) ---
router.get('/jp', isAuthenticated, isAdmin, adminJpController.getJpPage);

// --- API: DATA LIST JP ---
router.get('/jp/list', isAuthenticated, isAdmin, adminJpController.getJpList);

// --- API: APPROVE JP ---
router.post('/jp/approve/:id', isAuthenticated, isAdmin, adminJpController.approveJp);

// --- API: REJECT JP ---
router.post('/jp/reject/:id', isAuthenticated, isAdmin, adminJpController.rejectJp);

module.exports = router;