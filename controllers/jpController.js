const { ValidasiJp, User } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

const jpController = {
    // Render Submit JP Page
    getSubmitPage: (req, res) => {
        res.render('user/submit-jp', {
            user: req.session.user,
            page: 'submit-jp'
        });
    },

    // API: Create JP Submission
    createSubmit: async (req, res) => {
        try {
            const { nama_sertif, jumlah_jp, bulan, tahun, catatan } = req.body;
            const userId = req.session.user.id_user;

            // Validation
            if (!nama_sertif || !jumlah_jp || !bulan || !tahun) {
                return res.json({ success: false, message: 'Semua field wajib diisi' });
            }

            if (parseInt(jumlah_jp) <= 0) {
                return res.json({ success: false, message: 'Jumlah JP harus lebih dari 0' });
            }

            // File upload handling
            let filePath = null;
            if (req.file) {
                filePath = `/uploads/sertifikat/${req.file.filename}`;
            }

            // Create submission
            await ValidasiJp.create({
                id_user: userId,
                nama_sertif,
                jumlah_jp: parseInt(jumlah_jp),
                bulan,
                tahun: parseInt(tahun),
                catatan: catatan || null,
                file_sertif: filePath,
                status: 'pending'
            });

            res.json({ success: true, message: 'Submit JP berhasil' });
        } catch (error) {
            console.error('Error creating JP submission:', error);
            res.json({ success: false, message: 'Gagal submit JP' });
        }
    },

    // Render Riwayat Submit Page
    getRiwayatPage: (req, res) => {
        res.render('user/riwayat-submit', {
            user: req.session.user,
            page: 'riwayat-submit'
        });
    },

    // API: Get Riwayat Submit
    getRiwayatList: async (req, res) => {
        try {
            const userId = req.session.user.id_user;
            const { search, status } = req.query;

            let whereClause = { id_user: userId };

            // Filter by status
            if (status && status !== 'all') {
                whereClause.status = status;
            }

            // Search by nama sertifikat
            if (search) {
                whereClause.nama_sertif = { [Op.like]: `%${search}%` };
            }

            const submissions = await ValidasiJp.findAll({
                where: whereClause,
                order: [['createdAt', 'DESC']]
            });

            // Format data
            const formattedSubmissions = submissions.map(s => ({
                id: s.id_validasiJp,
                nama_sertif: s.nama_sertif,
                jumlah_jp: s.jumlah_jp,
                bulan: s.bulan,
                tahun: s.tahun,
                catatan: s.catatan,
                file_sertif: s.file_sertif,
                status: s.status,
                createdAt: s.createdAt,
                updatedAt: s.updatedAt
            }));

            res.json({ success: true, submissions: formattedSubmissions });
        } catch (error) {
            console.error('Error fetching riwayat:', error);
            res.json({ success: false, message: 'Gagal mengambil riwayat' });
        }
    }
};

module.exports = jpController;
