const { Pengajuan, PengajuanItem, Barang, User } = require('../models');
const { Op } = require('sequelize');

const pengajuanController = {
    // Render Halaman Katalog
    getKatalogPage: (req, res) => {
        res.render('user/katalog', {
            user: req.session.user,
            page: 'katalog'
        });
    },

    // API: Get List Barang untuk Katalog
    getKatalogList: async (req, res) => {
        try {
            const { search } = req.query;
            let whereClause = {};

            // Filter pencarian
            if (search) {
                whereClause.nama_barang = { [Op.like]: `%${search}%` };
            }

            const barangs = await Barang.findAll({
                where: whereClause,
                order: [['nama_barang', 'ASC']]
            });

            // Format data untuk katalog
            const formattedBarangs = barangs.map(b => ({
                id: b.id_barang,
                nama_barang: b.nama_barang,
                quantity: b.quantity,
                satuan: b.satuan || 'pcs',
                keterangan: b.keterangan || '-',
                status_stok: b.status_stok,
                tersedia: b.quantity > 0
            }));

            res.json({ success: true, barangs: formattedBarangs });
        } catch (error) {
            console.error("Error Fetch Katalog:", error);
            res.json({ success: false, message: 'Gagal mengambil data katalog' });
        }
    },

    // API: Create Pengajuan
    createPengajuan: async (req, res) => {
        try {
            const { items, catatan_user } = req.body;
            const userId = req.session.user.id_user;

            console.log('=== CREATE PENGAJUAN DEBUG ===');
            console.log('User ID:', userId);
            console.log('Items:', JSON.stringify(items, null, 2));
            console.log('Catatan:', catatan_user);

            // Validasi items
            if (!items || items.length === 0) {
                return res.json({ success: false, message: 'Tidak ada barang yang diajukan' });
            }

            // Validasi stok untuk setiap item
            for (const item of items) {
                const barang = await Barang.findByPk(item.id_barang);
                console.log('Checking barang:', item.id_barang, barang ? 'Found' : 'Not Found');

                if (!barang) {
                    return res.json({ success: false, message: `Barang dengan ID ${item.id_barang} tidak ditemukan` });
                }
                if (barang.quantity < item.jumlah_diminta) {
                    return res.json({
                        success: false,
                        message: `Stok ${barang.nama_barang} tidak mencukupi. Tersedia: ${barang.quantity}`
                    });
                }
            }

            console.log('Creating pengajuan...');
            // Create pengajuan
            const pengajuan = await Pengajuan.create({
                id_user: userId,
                tanggal_pengajuan: new Date(),
                status_pengajuan: 'diajukan',
                catatan_user: catatan_user || null
            });

            console.log('Pengajuan created:', pengajuan.id_pengajuan);

            // Create pengajuan items
            const pengajuanItems = items.map(item => ({
                id_pengajuan: pengajuan.id_pengajuan,
                id_barang: item.id_barang,
                jumlah_diminta: item.jumlah_diminta
            }));

            console.log('Creating items:', JSON.stringify(pengajuanItems, null, 2));
            await PengajuanItem.bulkCreate(pengajuanItems);

            console.log('Success!');
            res.json({ success: true, message: 'Pengajuan berhasil dibuat' });
        } catch (error) {
            console.error("Error Create Pengajuan:", error);
            console.error("Error Stack:", error.stack);
            console.error("Error Message:", error.message);
            res.json({ success: false, message: 'Gagal membuat pengajuan: ' + error.message });
        }
    },

    // Render Halaman Riwayat Pengajuan
    getRiwayatPage: (req, res) => {
        res.render('user/riwayat-pengajuan', {
            user: req.session.user,
            page: 'riwayat'
        });
    },

    // API: Get Riwayat Pengajuan User
    getRiwayatList: async (req, res) => {
        try {
            const userId = req.session.user.id_user;
            const { search, status } = req.query;

            let whereClause = { id_user: userId };

            // Filter by status
            if (status && status !== 'all') {
                whereClause.status_pengajuan = status;
            }

            const pengajuans = await Pengajuan.findAll({
                where: whereClause,
                include: [
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

            // Filter by search (item name)
            let filteredPengajuans = pengajuans;
            if (search) {
                filteredPengajuans = pengajuans.filter(p => {
                    return p.items.some(item =>
                        item.barang.nama_barang.toLowerCase().includes(search.toLowerCase())
                    );
                });
            }

            // Format data
            const formattedPengajuans = filteredPengajuans.map(p => ({
                id: p.id_pengajuan,
                tanggal_pengajuan: p.tanggal_pengajuan,
                status: p.status_pengajuan,
                catatan_user: p.catatan_user,
                catatan_admin: p.catatan_admin,
                tanggal_diproses: p.tanggal_diproses,
                admin_nama: p.admin ? p.admin.nama : null,
                items: p.items.map(item => ({
                    nama_barang: item.barang.nama_barang,
                    satuan: item.barang.satuan,
                    jumlah_diminta: item.jumlah_diminta,
                    jumlah_disetujui: item.jumlah_disetujui
                })),
                createdAt: p.createdAt,
                updatedAt: p.updatedAt
            }));

            res.json({ success: true, pengajuans: formattedPengajuans });
        } catch (error) {
            console.error("Error Fetch Riwayat:", error);
            res.json({ success: false, message: 'Gagal mengambil riwayat pengajuan' });
        }
    }
};

module.exports = pengajuanController;
