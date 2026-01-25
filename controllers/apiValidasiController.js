const { ValidasiJp, User } = require('../models');
const path = require('path');

// Ambil semua data bukti milik user login
exports.getKeaktifan = async (req, res) => {
    try {
        // ADAPTASI: Menggunakan req.session.user.id_user (SIPANDI) bukan req.user.id (JWT Kabad)
        const id_user = req.session.user.id_user;
        
        const data = await ValidasiJp.findAll({
            where: { id_user },
            order: [['createdAt', 'DESC']]
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.uploadBukti = async (req, res) => {
    try {
        const id_user = req.session.user.id_user;
        // Mapping field dari form frontend Kabad ke database SIPANDI
        const { jp, tanggal_mulai, tanggal_selesai } = req.body; 
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Tidak ada file yang diunggah" });
        }

        const uploads = req.files.map(file => ({
            id_user,
            nama_sertif: file.originalname,
            jumlah_jp: jp, // Mapping ke field ValidasiJp
            file_sertif: file.filename,
            tanggal_mulai: tanggal_mulai,
            tanggal_selesai: tanggal_selesai,
            status: 'pending',
            catatan: 'Menunggu verifikasi'
        }));

        await ValidasiJp.bulkCreate(uploads);
        res.status(201).json({ message: "Semua bukti berhasil disimpan" });
    } catch (error) {
        console.error("Error Upload:", error); 
        res.status(500).json({ error: error.message });
    }
};

exports.deleteKeaktifan = async (req, res) => {
    try {
        const { id } = req.params;
        const id_user = req.session.user.id_user;
        
        // Hapus berdasarkan ID dan kepemilikan user (Security)
        const deleted = await ValidasiJp.destroy({ 
            where: { 
                id_validasiJp: id, 
                id_user: id_user 
            } 
        });

        if (!deleted) {
            return res.status(404).json({ message: "Data tidak ditemukan atau bukan milik anda" });
        }

        res.json({ message: "Data berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};