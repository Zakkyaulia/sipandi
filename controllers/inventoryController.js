const { Barang } = require('../models');
const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');

const inventoryController = {
    // Render Halaman Inventory
    getInventoryPage: (req, res) => {
        res.render('admin/inventory', {
            user: req.session.user,
            page: 'inventory'
        });
    },

    // API: Get List Barang
    getInventoryList: async (req, res) => {
        try {
            const { search, status } = req.query;
            let whereClause = {};

            // Filter pencarian nama barang
            if (search) {
                whereClause.nama_barang = { [Op.like]: `%${search}%` };
            }

            const barangs = await Barang.findAll({
                where: whereClause,
                order: [['updatedAt', 'DESC']]
            });

            // Filter status stok (dilakukan setelah fetch karena status_stok adalah virtual field)
            let filteredBarangs = barangs;
            if (status && status !== 'all') {
                filteredBarangs = barangs.filter(b => {
                    const statusStok = b.status_stok;
                    if (status === 'tersedia') return statusStok === 'Tersedia';
                    if (status === 'stok_sedikit') return statusStok === 'Stok Sedikit';
                    if (status === 'perbarui_stok') return statusStok === 'Perbarui Stok';
                    return true;
                });
            }

            const formattedBarangs = filteredBarangs.map(b => ({
                id: b.id_barang,
                nama_barang: b.nama_barang,
                quantity: b.quantity,
                satuan: b.satuan || 'pcs',
                keterangan: b.keterangan || '-',
                threshold_stok_sedikit: b.threshold_stok_sedikit,
                threshold_stok_habis: b.threshold_stok_habis,
                status_stok: b.status_stok,
                createdAt: b.createdAt,
                updatedAt: b.updatedAt
            }));

            res.json({ success: true, barangs: formattedBarangs });
        } catch (error) {
            console.error("Error Fetch Barangs:", error);
            res.json({ success: false, message: 'Gagal mengambil data barang' });
        }
    },

    // API: Create Barang
    createBarang: async (req, res) => {
        try {
            const {
                nama_barang,
                quantity,
                satuan,

                keterangan,
                threshold_stok_sedikit,
                threshold_stok_habis
            } = req.body;

            // Validasi input
            if (!nama_barang || nama_barang.trim() === '') {
                return res.json({ success: false, message: 'Nama barang harus diisi' });
            }

            if (quantity === undefined || quantity === null || quantity < 0) {
                return res.json({ success: false, message: 'Quantity tidak valid' });
            }

            // Cek duplikasi nama barang (case-insensitive)
            const existingBarang = await Barang.findOne({
                where: Sequelize.where(
                    Sequelize.fn('LOWER', Sequelize.col('nama_barang')),
                    Sequelize.fn('LOWER', nama_barang.trim())
                )
            });

            if (existingBarang) {
                return res.json({
                    success: false,
                    message: 'Barang dengan nama ini sudah ada. Silakan gunakan nama yang berbeda.'
                });
            }

            // Validasi threshold
            const thresholdHabis = parseInt(threshold_stok_habis) || 5;
            const thresholdSedikit = parseInt(threshold_stok_sedikit) || 10;

            if (thresholdHabis >= thresholdSedikit) {
                return res.json({
                    success: false,
                    message: 'Threshold stok habis harus lebih kecil dari threshold stok sedikit'
                });
            }

            await Barang.create({
                nama_barang: nama_barang.trim(),
                quantity: parseInt(quantity) || 0,
                satuan: satuan || 'pcs',
                keterangan: keterangan || null,
                threshold_stok_sedikit: thresholdSedikit,
                threshold_stok_habis: thresholdHabis
            });

            res.json({ success: true, message: 'Barang berhasil ditambahkan' });
        } catch (error) {
            console.error("Error Create Barang:", error);
            res.json({ success: false, message: 'Gagal menambah barang' });
        }
    },

    // API: Update Barang
    updateBarang: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                nama_barang,
                quantity,
                satuan,

                keterangan,
                threshold_stok_sedikit,
                threshold_stok_habis
            } = req.body;

            const barang = await Barang.findByPk(id);
            if (!barang) {
                return res.json({ success: false, message: 'Barang tidak ditemukan' });
            }

            // Validasi input
            if (!nama_barang || nama_barang.trim() === '') {
                return res.json({ success: false, message: 'Nama barang harus diisi' });
            }

            if (quantity === undefined || quantity === null || quantity < 0) {
                return res.json({ success: false, message: 'Quantity tidak valid' });
            }

            // Cek duplikasi nama barang (case-insensitive), kecuali barang yang sedang diedit
            const existingBarang = await Barang.findOne({
                where: {
                    [Op.and]: [
                        Sequelize.where(
                            Sequelize.fn('LOWER', Sequelize.col('nama_barang')),
                            Sequelize.fn('LOWER', nama_barang.trim())
                        ),
                        {
                            id_barang: {
                                [Op.ne]: id
                            }
                        }
                    ]
                }
            });

            if (existingBarang) {
                return res.json({
                    success: false,
                    message: 'Barang dengan nama ini sudah ada. Silakan gunakan nama yang berbeda.'
                });
            }

            // Validasi threshold
            const thresholdHabis = parseInt(threshold_stok_habis) || 5;
            const thresholdSedikit = parseInt(threshold_stok_sedikit) || 10;

            if (thresholdHabis >= thresholdSedikit) {
                return res.json({
                    success: false,
                    message: 'Threshold stok habis harus lebih kecil dari threshold stok sedikit'
                });
            }

            barang.nama_barang = nama_barang.trim();
            barang.quantity = parseInt(quantity) || 0;
            barang.satuan = satuan || 'pcs';
            barang.keterangan = keterangan || null;
            barang.threshold_stok_sedikit = thresholdSedikit;
            barang.threshold_stok_habis = thresholdHabis;

            await barang.save();

            res.json({ success: true, message: 'Barang berhasil diperbarui' });
        } catch (error) {
            console.error("Error Update Barang:", error);
            res.json({ success: false, message: 'Gagal memperbarui barang' });
        }
    },

    // API: Delete Barang
    deleteBarang: async (req, res) => {
        try {
            const { id } = req.params;

            const barang = await Barang.findByPk(id);
            if (!barang) {
                return res.json({ success: false, message: 'Barang tidak ditemukan' });
            }

            await barang.destroy();
            res.json({ success: true, message: 'Barang berhasil dihapus' });
        } catch (error) {
            console.error("Error Delete Barang:", error);
            res.json({ success: false, message: 'Gagal menghapus barang' });
        }
    },


};

module.exports = inventoryController;
