// Middleware untuk check apakah user sudah authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login');
};

// Middleware untuk check apakah user adalah admin
const isAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.status(403).render('error', { message: 'Akses ditolak. Hanya admin yang dapat mengakses halaman ini.' });
};

// Middleware untuk check apakah user adalah asn
const isAsn = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'asn') {
        return next();
    }
    res.status(403).render('error', { message: 'Akses ditolak. Hanya ASN yang dapat mengakses halaman ini.' });
};

// Tambahan: Middleware untuk check apakah user adalah user biasa
const isUser = (req, res, next) => {
    if (req.session && req.session.user && (req.session.user.role === 'user' || req.session.user.role === 'asn')) {
        return next();
    }
    res.status(403).render('error', { message: 'Akses ditolak.' });
};

module.exports = { isAuthenticated, isAdmin, isAsn, isUser };