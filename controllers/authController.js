const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { nama, nip, password, role } = req.body; // Tambahkan role jika ada di form

    const existingUser = await User.findOne({ where: { nip } });
    if (existingUser) {
      return res.status(400).json({ message: "NIP sudah terdaftar" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      nama,
      nip,
      password: hashedPassword,
      role: role || 'user' // Default ke 'user' jika tidak diisi
    });

    res.status(201).json({ message: "Registrasi berhasil" });
  } catch (error) {
    res.status(500).json({ message: "Server error saat register", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { nip, password } = req.body;

    const user = await User.findOne({ where: { nip } });
    if (!user) {
      return res.status(404).json({ message: "NIP tidak ditemukan" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password salah" });
    }

    // --- PERBAIKAN: SIMPAN KE SESSION ---
    // Agar middleware isAuthenticated bisa membaca data user
    req.session.user = {
        id: user.id,
        nama: user.nama,
        nip: user.nip,
        role: user.role
    };

    // Buat Token JWT (Tetap dipertahankan jika Anda butuh untuk API)
    const token = jwt.sign(
      { id: user.id, nip: user.nip, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: "Login berhasil",
      token,
      user: req.session.user
    });
  } catch (error) {
    res.status(500).json({ message: "Server error saat login", error: error.message });
  }
};