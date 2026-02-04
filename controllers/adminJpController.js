const { ValidasiJp, User } = require('../models');
const { Op } = require('sequelize');

const adminJpController = {
    // Render Kelola JP Page
    getJpPage: (req, res) => {
        res.render('admin/jp', {
            user: req.session.user,
            page: 'jp'
        });
    },

    // API: Get All JP Submissions
    getJpList: async (req, res) => {
        try {
            const { search, status, bidang, bulan, tahun } = req.query;
            let whereClause = {};
            let userWhereClause = {};

            // Filter by status
            if (status && status !== 'all') {
                whereClause.status = status;
            }

            // Filter by bulan
            if (bulan && bulan !== 'all') {
                whereClause.bulan = bulan;
            }

            // Filter by tahun
            if (tahun && tahun !== 'all') {
                whereClause.tahun = parseInt(tahun);
            }

            // Filter by bidang (unit_kerja)
            if (bidang && bidang !== 'all') {
                userWhereClause.unit_kerja = bidang;
            }

            const submissions = await ValidasiJp.findAll({
                where: whereClause,
                include: [{
                    model: User,
                    as: 'User',
                    attributes: ['nama', 'nip', 'unit_kerja'],
                    where: Object.keys(userWhereClause).length > 0 ? userWhereClause : undefined
                }],
                order: [['createdAt', 'DESC']]
            });

            // Filter by search (user name or sertifikat name)
            let filteredSubmissions = submissions;
            if (search) {
                filteredSubmissions = submissions.filter(s => {
                    const matchUser = s.User.nama.toLowerCase().includes(search.toLowerCase()) ||
                        s.User.nip.toLowerCase().includes(search.toLowerCase());
                    const matchSertif = s.nama_sertif.toLowerCase().includes(search.toLowerCase());
                    return matchUser || matchSertif;
                });
            }

            // Format data
            const formattedSubmissions = filteredSubmissions.map(s => ({
                id: s.id_validasiJp,
                nama_sertif: s.nama_sertif,
                jumlah_jp: s.jumlah_jp,
                bulan: s.bulan,
                tahun: s.tahun,
                catatan: s.catatan,
                file_sertif: s.file_sertif,
                status: s.status,
                user: {
                    nama: s.User.nama,
                    nip: s.User.nip,
                    unit_kerja: s.User.unit_kerja
                },
                createdAt: s.createdAt,
                updatedAt: s.updatedAt
            }));

            res.json({ success: true, submissions: formattedSubmissions });
        } catch (error) {
            console.error('Error fetching JP submissions:', error);
            res.json({ success: false, message: 'Gagal mengambil data JP' });
        }
    },

    // API: Approve JP Submission
    approveJp: async (req, res) => {
        try {
            const { id } = req.params;
            const { catatan_admin } = req.body;

            const submission = await ValidasiJp.findByPk(id);

            if (!submission) {
                return res.json({ success: false, message: 'Submission tidak ditemukan' });
            }

            if (submission.status !== 'pending') {
                return res.json({ success: false, message: 'Submission sudah diproses sebelumnya' });
            }

            // Update status to diterima
            await submission.update({
                status: 'diterima',
                catatan: catatan_admin || submission.catatan
            });

            res.json({ success: true, message: 'JP berhasil disetujui' });
        } catch (error) {
            console.error('Error approving JP:', error);
            res.json({ success: false, message: 'Gagal menyetujui JP' });
        }
    },

    // API: Reject JP Submission
    rejectJp: async (req, res) => {
        try {
            const { id } = req.params;
            const { catatan_admin } = req.body;

            if (!catatan_admin) {
                return res.json({ success: false, message: 'Catatan penolakan wajib diisi' });
            }

            const submission = await ValidasiJp.findByPk(id);

            if (!submission) {
                return res.json({ success: false, message: 'Submission tidak ditemukan' });
            }

            if (submission.status !== 'pending') {
                return res.json({ success: false, message: 'Submission sudah diproses sebelumnya' });
            }

            // Update status to ditolak
            await submission.update({
                status: 'ditolak',
                catatan: catatan_admin
            });

            res.json({ success: true, message: 'JP berhasil ditolak' });
        } catch (error) {
            console.error('Error rejecting JP:', error);
            res.json({ success: false, message: 'Gagal menolak JP' });
        }
    }
};

module.exports = adminJpController;
