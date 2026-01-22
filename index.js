// index.js
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/authRoutes');

// Inisialisasi Express
const app = express();

// Middleware untuk memproses data JSON dari body request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing Utama
app.get('/', (req, res) => {
    res.json({ message: "Selamat datang di API SIPANDI" });
});

// Daftarkan rute autentikasi
app.use('/api/auth', authRoutes);

// Menentukan Port
const PORT = process.env.PORT || 3000;

// Menjalankan Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
});