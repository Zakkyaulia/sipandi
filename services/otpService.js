const crypto = require('crypto');

exports.generateOTP = () => {
    // Generate 6 digit random number securely
    return crypto.randomInt(100000, 999999).toString();
};
