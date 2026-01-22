const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { nama, nip, password } = req.body;

    // Cek apakah NIP sudah terdaftar
    const existingUser = await User.findOne({ where: { nip } });
    if (existingUser) {
      return res.status(400).json({ message: "NIP sudah terdaftar" });
    }

    // Enkripsi password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan ke database
    await User.create({
      nama,
      nip,
      password: hashedPassword
    });

    res.status(201).json({ message: "Registrasi berhasil" });
  } catch (error) {
    res.status(500).json({ message: "Server error saat register", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { nip, password } = req.body;

    // Cari user berdasarkan NIP
    const user = await User.findOne({ where: { nip } });
    if (!user) {
      return res.status(404).json({ message: "NIP tidak ditemukan" });
    }

    // Cek Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password salah" });
    }

    // Buat Token JWT
    const token = jwt.sign(
      { id: user.id, nip: user.nip },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: "Login berhasil",
      token,
      user: { nama: user.nama, nip: user.nip }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error saat login", error: error.message });
  }
};