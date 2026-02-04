const { User, PasswordReset } = require('../models');
const emailService = require('../services/emailService');
const otpService = require('../services/otpService');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// Render Halaman Lupa Password
exports.renderForgotPassword = (req, res) => {
    res.render('auth/forgot-password', { error: null, success: null });
};

// Proses Kirim OTP
exports.sendOTP = async (req, res) => {
    const { email } = req.body;

    try {
        // 1. Cek apakah user ada (Opsional: untuk security, jangan beri tahu jika user tidak ada)
        // Namun untuk UX internal/dashboard, memberi tahu mungkin lebih baik. 
        // Kita gunakan pendekatan aman: Generic message jika email formatnya valid.
        const user = await User.findOne({ where: { email } });

        if (!user) {
            // Delay sedikit untuk mencegah timing attack (simulasi proses)
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Return sukses palsu agar hacker tidak bisa enum email
            return res.render('auth/verify-otp', {
                email: email, // Bawa email ke halaman verifikasi untuk UX
                success: 'Jika email terdaftar, kode OTP telah dikirim.',
                error: null
            });
        }

        // 2. Generate OTP
        const otp = otpService.generateOTP();
        const otpHash = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit dari sekarang

        // 3. Simpan ke DB
        await PasswordReset.create({
            email: email,
            otp_hash: otpHash,
            expires_at: expiresAt,
            attempts: 0
        });

        // 4. Kirim Email
        const emailSent = await emailService.sendOTP(email, otp);

        if (!emailSent) {
            return res.render('auth/forgot-password', {
                error: 'Gagal mengirim email. Silakan coba lagi.',
                success: null
            });
        }

        // 5. Redirect ke halaman verifikasi
        res.render('auth/verify-otp', {
            email: email,
            success: 'Kode OTP telah dikirim ke email Anda.',
            error: null
        });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.render('auth/forgot-password', {
            error: 'Terjadi kesalahan server.',
            success: null
        });
    }
};

// Render Halaman Verifikasi OTP
exports.renderVerifyOTP = (req, res) => {
    // Bisa ambil email dari query param jika ada
    const email = req.query.email || '';
    res.render('auth/verify-otp', { email, error: null, success: null });
};

// Proses Verifikasi OTP
exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        // 1. Cari record OTP terakhir untuk email ini
        const record = await PasswordReset.findOne({
            where: { email },
            order: [['createdAt', 'DESC']]
        });

        if (!record) {
            return res.render('auth/verify-otp', { email, error: 'OTP tidak valid atau kadaluwarsa.', success: null });
        }

        // 2. Cek apakah expired
        if (new Date() > record.expires_at) {
            return res.render('auth/verify-otp', { email, error: 'OTP sudah kadaluwarsa. Silakan minta baru.', success: null });
        }

        // 3. Cek jumlah percobaan (Rate Limit sederhana)
        if (record.attempts >= 3) {
            return res.render('auth/verify-otp', { email, error: 'Terlalu banyak percobaan salah. Silakan minta OTP baru.', success: null });
        }

        // 4. Verifikasi Hash OTP
        const isValid = await bcrypt.compare(otp, record.otp_hash);

        if (!isValid) {
            // Increment attempts
            await record.increment('attempts');
            return res.render('auth/verify-otp', { email, error: 'Kode OTP salah.', success: null });
        }

        // 5. Jika sukses: Set Session flag
        req.session.resetVerified = true;
        req.session.resetEmail = email;

        // Redirect ke halaman input password baru
        res.redirect('/reset-password');

    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.render('auth/verify-otp', { email, error: 'Terjadi kesalahan sistem.', success: null });
    }
};

// Render Halaman Reset Password
exports.renderResetPassword = (req, res) => {
    // Security Check: Pastikan user sudah lolos verifikasi OTP via session
    if (!req.session.resetVerified || !req.session.resetEmail) {
        return res.redirect('/forgot-password');
    }

    res.render('auth/reset-password', { error: null, success: null });
};

// Proses Reset Password
exports.resetPassword = async (req, res) => {
    // Security Check
    if (!req.session.resetVerified || !req.session.resetEmail) {
        return res.redirect('/forgot-password');
    }

    const { password, confirmPassword } = req.body;
    const email = req.session.resetEmail;

    if (password !== confirmPassword) {
        return res.render('auth/reset-password', { error: 'Konfirmasi password tidak cocok.', success: null });
    }

    if (password.length < 6) {
        return res.render('auth/reset-password', { error: 'Password minimal 6 karakter.', success: null });
    }

    try {
        // 1. Hash Password Baru
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Update User
        await User.update({ password: hashedPassword }, { where: { email } });

        // 3. Bersihkan Session & Invalidasi OTP
        req.session.resetVerified = null;
        req.session.resetEmail = null;

        // Hapus record OTP (Optional/Cleanup)
        await PasswordReset.destroy({ where: { email } });

        // 4. Redirect Login
        res.render('login', { success: 'Password berhasil diubah. Silakan login.', error: null }); // Asumsi view 'login' ada di root views

    } catch (error) {
        console.error('Reset Password Error:', error);
        res.render('auth/reset-password', { error: 'Gagal mereset password.', success: null });
    }
};
