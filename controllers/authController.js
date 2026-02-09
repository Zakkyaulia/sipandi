const { User, Role } = require('../models');
const bcrypt = require('bcryptjs');

// --- LOGIN ---
exports.login = async (req, res) => {
  // Sesuaikan field dengan form frontend (username/password)
  const { username, password } = req.body;

  try {
    // Validasi NIP/Username
    if (username !== 'admin' && username.length !== 18) {
      return res.json({ success: false, message: 'NIP harus berjumlah 18 digit angka' });
    }

    // Cari User + Roles
    const user = await User.findOne({
      where: { nip: username },
      include: [{
        model: Role,
        as: 'roles',
        through: { attributes: [] }
      }]
    });

    if (!user) {
      return res.json({ success: false, message: 'Username atau password salah' });
    }

    // Cek Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Username atau password salah' });
    }

    // Logika Role
    const userRoles = user.roles || [];

    // Helper Identifier URL
    const getRedirectUrl = (roleName) => {
      const map = {
        'admin': '/admin/dashboard',
        'admin_atk': '/admin/pengajuan',
        'admin_validasi_jp': '/admin/jp',
        'asn': '/user/dashboard',
        'asn2': '/user/dashboard'
      };
      return map[roleName] || '/user/dashboard';
    };

    // KASUS 1: Multi Role
    if (userRoles.length > 1) {
      req.session.tempUser = {
        id_user: user.id_user,
        nama: user.nama,
        nip: user.nip,
        roles: userRoles.map(r => ({ name: r.name, display_name: r.display_name }))
      };
      return res.json({ success: true, redirectUrl: '/auth/select-role', message: 'Silakan pilih role' });
    }

    // KASUS 2: Single Role / Fallback
    let activeRole = 'asn';
    if (userRoles.length === 1) {
      activeRole = userRoles[0].name;
    } else if (user.role) {
      // Fallback legacy column
      activeRole = user.role;
    }

    // Set Session Final
    req.session.user = {
      id_user: user.id_user,
      nama: user.nama,
      nip: user.nip,
      role: activeRole,
      unit_kerja: user.unit_kerja,
      email: user.email
    };

    const redirectUrl = getRedirectUrl(activeRole);
    return res.json({ success: true, redirectUrl, message: 'Login berhasil' });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server saat login" });
  }
};

// --- REGISTER ---
exports.register = async (req, res) => {
  // Note: Parameter sesuaikan dengan form (nama vs username, dst)
  // Di route lama: username, nip, password, confirmPassword, email, unit_kerja
  // Di controller lama: nama, nip, password, role
  // Kita ikuti standar route lama karena itu yang dipakai view.

  const { username, nip, password, confirmPassword, email, unit_kerja } = req.body;

  // Validasi Basic
  if (!username || !nip || !password || !confirmPassword || !email || !unit_kerja) {
    return res.render('register', { error: 'Semua field harus diisi', success: null });
  }

  if (password !== confirmPassword) {
    return res.render('register', { error: 'Password tidak cocok', success: null });
  }

  try {
    const existingUser = await User.findOne({ where: { nip } });
    if (existingUser) {
      return res.render('register', { error: 'NIP sudah terdaftar', success: null });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      nama: username,
      nip,
      password: hashedPassword,
      email,
      unit_kerja,
      role: 'asn' // Legacy support
    });

    // Assign Role 'asn' di tabel UserRoles
    const defaultRole = await Role.findOne({ where: { name: 'asn' } });
    if (defaultRole) {
      await newUser.addRole(defaultRole);
    }

    res.render('login', { error: null, success: 'Registrasi berhasil, silakan login' });

  } catch (error) {
    console.error('Register Error:', error);
    res.render('register', { error: 'Terjadi kesalahan server', success: null });
  }
};

// --- SELECT ROLE PAGE (GET) ---
exports.renderSelectRole = (req, res) => {
  if (!req.session.tempUser) {
    return res.redirect('/login');
  }
  res.render('auth/select-role', { roles: req.session.tempUser.roles });
};

// --- SELECT ROLE ACTION (POST) ---
exports.selectRole = async (req, res) => {
  console.log('--- SELECT ROLE START ---');
  console.log('Body:', req.body);

  // 1. Cek Body
  const { selectedRole } = req.body;
  if (!selectedRole) {
    console.error('Error: No selectedRole in body');
    return res.status(400).send('Role harus dipilih');
  }

  // 2. Cek Session TempUser
  const tempUser = req.session.tempUser;
  if (!tempUser) {
    console.warn('Warning: No tempUser in session, redirecting to login');
    return res.redirect('/login');
  }
  console.log('TempUser:', JSON.stringify(tempUser));

  try {
    // 3. Validasi Role
    // Pastikan tempUser.roles adalah array
    const roles = Array.isArray(tempUser.roles) ? tempUser.roles : [];
    const isValid = roles.find(r => r.name === selectedRole);

    if (!isValid) {
      console.error(`Error: Invalid role ${selectedRole} for user ${tempUser.nip}`);
      return res.status(403).send('Role tidak valid untuk akun ini');
    }

    // 4. Ambil User dari DB
    console.log(`Fetching user ID: ${tempUser.id_user}`);
    const user = await User.findOne({ where: { id_user: tempUser.id_user } });

    if (!user) {
      console.error(`Error: User ID ${tempUser.id_user} not found in DB`);
      // Jika user hilang dari DB, hapus sesi sekalian
      req.session.destroy();
      return res.redirect('/login?error=user_not_found');
    }
    console.log('User found:', user.nama);

    // 5. Siapkan Helper Redirect
    const getRedirectUrl = (roleName) => {
      const map = {
        'admin': '/admin/dashboard',
        'admin_atk': '/admin/pengajuan',
        'admin_validasi_jp': '/admin/jp',
        'asn': '/user/dashboard',
        'asn2': '/user/dashboard'
      };
      return map[roleName] || '/user/dashboard';
    };

    // 6. Update Session User
    req.session.user = {
      id_user: user.id_user,
      nama: user.nama,
      nip: user.nip,
      role: selectedRole,
      unit_kerja: user.unit_kerja,
      email: user.email
    };
    console.log('New Session User:', req.session.user);

    // 7. Hapus TempUser
    delete req.session.tempUser;

    // 8. Simpan Session & Redirect
    req.session.save((err) => {
      if (err) {
        console.error('CRITICAL: Session Save Error:', err);
        return res.status(500).send('Gagal menyimpan sesi login. Silakan coba lagi.');
      }
      const redirectUrl = getRedirectUrl(selectedRole);
      console.log(`Redirecting to: ${redirectUrl}`);
      res.redirect(redirectUrl);
    });

  } catch (error) {
    console.error('CRITICAL UNCAUGHT ERROR in selectRole:', error);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
};