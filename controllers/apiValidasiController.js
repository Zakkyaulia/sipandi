const { ValidasiJp, User } = require('../models');
const path = require('path');

exports.getKeaktifan = async (req, res) => {
    try {
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
        // GANTI: Ambil bulan dan tahun dari body, bukan tanggal_mulai/selesai
        const { jp, bulan, tahun } = req.body; 
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Tidak ada file yang diunggah" });
        }

        const uploads = req.files.map(file => ({
            id_user,
            nama_sertif: file.originalname,
            jumlah_jp: jp,
            file_sertif: file.filename,
            bulan: bulan,  // Simpan Bulan
            tahun: tahun,  // Simpan Tahun
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