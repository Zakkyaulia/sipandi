const { Pengajuan, PengajuanItem, Barang, User } = require('../models');
const { Op } = require('sequelize');

const adminPengajuanController = {
    // Render Halaman Kelola Pengajuan
    getPengajuanPage: (req, res) => {
        res.render('admin/pengajuan', {
            user: req.session.user,
            page: 'pengajuan'
        });
    },

    // API: Get List All Pengajuan
    getPengajuanList: async (req, res) => {
        try {
            const { search, status, bidang } = req.query;
            let whereClause = {};
            let userWhereClause = {};

            // Filter by status
            if (status && status !== 'all') {
                whereClause.status_pengajuan = status;
            }

            // Filter by bidang (unit_kerja)
            if (bidang && bidang !== 'all') {
                userWhereClause.unit_kerja = bidang;
            }

            const pengajuans = await Pengajuan.findAll({
                where: whereClause,
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['nama', 'nip', 'unit_kerja'],
                        where: Object.keys(userWhereClause).length > 0 ? userWhereClause : undefined
                    },
                    {
                        model: PengajuanItem,
                        as: 'items',
                        include: [{
                            model: Barang,
                            as: 'barang'
                        }]
                    },
                    {
                        model: User,
                        as: 'admin',
                        attributes: ['nama']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            // Filter by search (user name or item name)
            let filteredPengajuans = pengajuans;
            if (search) {
                filteredPengajuans = pengajuans.filter(p => {
                    const matchUser = p.user.nama.toLowerCase().includes(search.toLowerCase()) ||
                        p.user.nip.toLowerCase().includes(search.toLowerCase());
                    const matchItem = p.items.some(item =>
                        item.barang.nama_barang.toLowerCase().includes(search.toLowerCase())
                    );
                    return matchUser || matchItem;
                });
            }

            // Format data
            const formattedPengajuans = filteredPengajuans.map(p => ({
                id: p.id_pengajuan,
                tanggal_pengajuan: p.tanggal_pengajuan,
                status: p.status_pengajuan,
                user: {
                    nama: p.user.nama,
                    nip: p.user.nip,
                    unit_kerja: p.user.unit_kerja
                },
                catatan_user: p.catatan_user,
                catatan_admin: p.catatan_admin,
                tanggal_diproses: p.tanggal_diproses,
                admin_nama: p.admin ? p.admin.nama : null,
                items: p.items.map(item => ({
                    id: item.id,
                    id_barang: item.id_barang,
                    nama_barang: item.barang.nama_barang,
                    satuan: item.barang.satuan,
                    stok_tersedia: item.barang.quantity,
                    jumlah_diminta: item.jumlah_diminta,
                    jumlah_disetujui: item.jumlah_disetujui
                })),
                total_items: p.items.length,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt
            }));

            res.json({ success: true, pengajuans: formattedPengajuans });
        } catch (error) {
            console.error("Error Fetch Pengajuan:", error);
            res.json({ success: false, message: 'Gagal mengambil data pengajuan' });
        }
    },

    // API: Approve Pengajuan
    approvePengajuan: async (req, res) => {
        try {
            const { id } = req.params;
            const { items, catatan_admin } = req.body;
            const adminId = req.session.user.id_user;

            const pengajuan = await Pengajuan.findByPk(id, {
                include: [{
                    model: PengajuanItem,
                    as: 'items',
                    include: [{ model: Barang, as: 'barang' }]
                }]
            });

            if (!pengajuan) {
                return res.json({ success: false, message: 'Pengajuan tidak ditemukan' });
            }

            if (pengajuan.status_pengajuan !== 'diajukan') {
                return res.json({ success: false, message: 'Pengajuan sudah diproses sebelumnya' });
            }

            // Validate and update each item
            for (const itemData of items) {
                const pengajuanItem = pengajuan.items.find(i => i.id === itemData.id);
                if (!pengajuanItem) continue;

                const barang = pengajuanItem.barang;
                const jumlahDisetujui = parseInt(itemData.jumlah_disetujui);

                // Validasi
                if (jumlahDisetujui > pengajuanItem.jumlah_diminta) {
                    return res.json({
                        success: false,
                        message: `Jumlah disetujui tidak boleh melebihi jumlah diminta untuk ${barang.nama_barang}`
                    });
                }

                if (jumlahDisetujui > barang.quantity) {
                    return res.json({
                        success: false,
                        message: `Stok ${barang.nama_barang} tidak mencukupi. Tersedia: ${barang.quantity}`
                    });
                }

                // Update pengajuan item
                await pengajuanItem.update({
                    jumlah_disetujui: jumlahDisetujui
                });

                // Kurangi stok barang
                await barang.update({
                    quantity: barang.quantity - jumlahDisetujui
                });
            }

            // Update pengajuan status
            await pengajuan.update({
                status_pengajuan: 'disetujui',
                catatan_admin: catatan_admin || null,
                tanggal_diproses: new Date(),
                diproses_oleh: adminId
            });

            res.json({ success: true, message: 'Pengajuan berhasil disetujui' });
        } catch (error) {
            console.error("Error Approve Pengajuan:", error);
            res.json({ success: false, message: 'Gagal menyetujui pengajuan' });
        }
    },

    // API: Reject Pengajuan
    rejectPengajuan: async (req, res) => {
        try {
            const { id } = req.params;
            const { catatan_admin } = req.body;
            const adminId = req.session.user.id_user;

            const pengajuan = await Pengajuan.findByPk(id);

            if (!pengajuan) {
                return res.json({ success: false, message: 'Pengajuan tidak ditemukan' });
            }

            if (pengajuan.status_pengajuan !== 'diajukan') {
                return res.json({ success: false, message: 'Pengajuan sudah diproses sebelumnya' });
            }

            // Update pengajuan status
            await pengajuan.update({
                status_pengajuan: 'ditolak',
                catatan_admin: catatan_admin || 'Pengajuan ditolak',
                tanggal_diproses: new Date(),
                diproses_oleh: adminId
            });

            res.json({ success: true, message: 'Pengajuan berhasil ditolak' });
        } catch (error) {
            console.error("Error Reject Pengajuan:", error);
            res.json({ success: false, message: 'Gagal menolak pengajuan' });
        }
    }
};

module.exports = adminPengajuanController;
