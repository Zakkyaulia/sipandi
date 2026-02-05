const { User, Pengajuan } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const userController = {
    // Dashboard Admin Stats
    getDashboard: async (req, res) => {
        try {
            const totalUsers = await User.count({ where: { role: 'asn' } });
            const recentUsers = await User.findAll({
                where: { role: 'asn' },
                limit: 5,
                order: [['createdAt', 'DESC']]
            });

            res.render('admin/dashboard', {
                user: req.session.user,
                totalUsers: totalUsers,
                recentUsers: recentUsers,
                page: 'dashboard'
            });
        } catch (error) {
            console.error("Error Dashboard:", error);
            res.status(500).send('Internal Server Error');
        }
    },

    // Dashboard User Stats (ASN & ASN2)
    getUserDashboard: async (req, res) => {
        try {
            const user = req.session.user;
            let pengajuanStats = null;

            // Jika role adalah ASN2, ambil statistik pengajuan barang
            if (user.role === 'asn2') {
                const pending = await Pengajuan.count({ where: { id_user: user.id_user, status_pengajuan: 'diajukan' } });
                const approved = await Pengajuan.count({ where: { id_user: user.id_user, status_pengajuan: 'disetujui' } });
                const rejected = await Pengajuan.count({ where: { id_user: user.id_user, status_pengajuan: 'ditolak' } });

                pengajuanStats = {
                    diajukan: pending,
                    disetujui: approved,
                    ditolak: rejected,
                    total: pending + approved + rejected
                };
            }

            res.render('user/dashboard', { 
                user: user,
                pengajuanStats: pengajuanStats 
            });
        } catch (error) {
            console.error("Error User Dashboard:", error);
            res.render('user/dashboard', { 
                user: req.session.user, 
                pengajuanStats: null 
            });
        }
    },

    // Render Halaman User
    getUsersPage: (req, res) => {
        res.render('admin/users', {
            user: req.session.user,
            page: 'users'
        });
    },

    // API: Get List Users
    getUsersList: async (req, res) => {
        try {
            const { search, role } = req.query;
            let whereClause = {};

            if (search) {
                whereClause = {
                    [Op.or]: [
                        { nama: { [Op.like]: `%${search}%` } },
                        { nip: { [Op.like]: `%${search}%` } }
                    ]
                };
            }

            if (role && role !== 'all') {
                whereClause.role = role;
            }

            const users = await User.findAll({
                where: whereClause,
                order: [['createdAt', 'DESC']]
            });

            const formattedUsers = users.map(u => ({
                id: u.id_user,
                name: u.nama,
                username: u.nip,
                email: u.email,
                unit_kerja: u.unit_kerja,
                role: u.role,
                status: 'active'
            }));

            res.json({ success: true, users: formattedUsers });
        } catch (error) {
            console.error("Error Fetch Users:", error);
            res.json({ success: false, message: 'Gagal mengambil data user' });
        }
    },

    // API: Create User
    createUser: async (req, res) => {
        try {
            const { name, username, password, role, unit_kerja, email } = req.body;

            const existingUser = await User.findOne({ where: { nip: username } });
            if (existingUser) {
                return res.json({ success: false, message: 'NIP sudah terdaftar' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await User.create({
                nama: name,
                nip: username,
                password: hashedPassword,
                role: role || 'asn',
                unit_kerja: unit_kerja || null,
                email: email || null
            });

            res.json({ success: true, message: 'User berhasil ditambahkan' });
        } catch (error) {
            console.error(error);
            res.json({ success: false, message: 'Gagal menambah user' });
        }
    },

    // API: Update User (Admin)
    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, username, password, role, unit_kerja, email } = req.body;

            const user = await User.findByPk(id);
            if (!user) {
                return res.json({ success: false, message: 'User tidak ditemukan' });
            }

            if (username !== user.nip) {
                const existingUser = await User.findOne({ where: { nip: username } });
                if (existingUser) {
                    return res.json({ success: false, message: 'NIP sudah terdaftar oleh user lain' });
                }
            }

            user.nama = name;
            user.nip = username;
            user.role = role;
            user.unit_kerja = unit_kerja || null;
            user.email = email || null;

            if (password && password.trim() !== "") {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
            }

            await user.save();

            res.json({ success: true, message: 'User berhasil diperbarui' });
        } catch (error) {
            console.error("Error Update User:", error);
            res.json({ success: false, message: 'Gagal memperbarui user' });
        }
    },

    // API: Update Profile (User Self)
    updateProfile: async (req, res) => {
        try {
            const id = req.session.user.id_user; // Get ID from session
            const { name, nip, password, unit_kerja, email } = req.body; // No role update

            const user = await User.findByPk(id);
            if (!user) {
                return res.json({ success: false, message: 'User tidak ditemukan' });
            }

            if (nip !== user.nip) {
                const existingUser = await User.findOne({ where: { nip: nip } });
                if (existingUser) {
                    return res.json({ success: false, message: 'NIP sudah terdaftar oleh user lain' });
                }
            }

            user.nama = name;
            user.nip = nip;
            user.unit_kerja = unit_kerja || null;
            user.email = email || null;

            if (password && password.trim() !== "") {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
            }

            await user.save();

            // Update Session
            req.session.user.nama = user.nama;
            req.session.user.nip = user.nip;
            req.session.user.unit_kerja = user.unit_kerja;
            req.session.user.email = user.email;
            // Password not stored in session

            res.json({ success: true, message: 'Profil berhasil diperbarui' });
        } catch (error) {
            console.error("Error Update Profile:", error);
            res.json({ success: false, message: 'Gagal memperbarui profil' });
        }
    },

    // API: Change Password
    changePassword: async (req, res) => {
        try {
            const id = req.session.user.id_user;
            const { currentPassword, newPassword } = req.body;

            const user = await User.findByPk(id);
            if (!user) {
                return res.json({ success: false, message: 'User tidak ditemukan' });
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.json({ success: false, message: 'incorrect_current_password' });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);

            await user.save();

            res.json({ success: true, message: 'Password berhasil diperbarui' });
        } catch (error) {
            console.error("Error Change Password:", error);
            res.json({ success: false, message: 'Gagal memperbarui password' });
        }
    },

    // API: Delete User
    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;
            await User.destroy({ where: { id_user: id } });
            res.json({ success: true, message: 'User berhasil dihapus' });
        } catch (error) {
            console.error(error);
            res.json({ success: false, message: 'Gagal menghapus user' });
        }
    },

    // API: Generate Password
    generatePassword: (req, res) => {
        const randomPassword = Math.random().toString(36).slice(-8);
        res.json({ success: true, password: randomPassword });
    }
};

module.exports = userController;