const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const userController = require('../controllers/userController');

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

module.exports = router;