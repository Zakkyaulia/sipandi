const nodemailer = require('nodemailer');

// Konfigurasi Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendOTP = async (to, otp) => {
    const mailOptions = {
        from: '"SIPANDI System" <no-reply@sipandi.com>',
        to: to,
        subject: 'Reset Password OTP - SIPANDI',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #2c3e50;">Permintaan Reset Password</h2>
                <p>Anda menerima email ini karena ada permintaan untuk mereset password akun SIPANDI Anda.</p>
                <p>Gunakan kode OTP berikut untuk melanjutkan:</p>
                <div style="background-color: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; border-radius: 5px; margin: 20px 0;">
                    ${otp}
                </div>
                <p>Kode ini akan kedaluwarsa dalam 5 menit.</p>
                <p style="font-size: 12px; color: #777;">Jika Anda tidak merasa meminta reset password, abaikan email ini.</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};
