const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login');
};

const isAdminUtama = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.status(403).render('error', { 
        message: 'Akses ditolak. Halaman ini hanya dapat diakses oleh Admin Utama.' 
    });
};

const isAdminAtk = (req, res, next) => {
    const role = req.session.user.role;
    if (role === 'admin' || role === 'admin_atk') {
        return next();
    }
    res.status(403).render('error', { 
        message: 'Akses ditolak. Halaman ini khusus untuk Admin ATK.' 
    });
};

const isAdminJp = (req, res, next) => {
    const role = req.session.user.role;
    if (role === 'admin' || role === 'admin_validasi_jp') {
        return next();
    }
    res.status(403).render('error', { 
        message: 'Akses ditolak. Halaman ini khusus untuk Admin Validasi JP.' 
    });
};

const isAsn = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'asn') {
        return next();
    }
    res.status(403).render('error', { 
        message: 'Akses ditolak. Hanya ASN yang dapat mengakses halaman ini.' 
    });
};

const isUser = (req, res, next) => {
    const role = req.session.user.role;
    if (role === 'user' || role === 'asn') {
        return next();
    }
    res.status(403).render('error', { message: 'Akses ditolak.' });
};

module.exports = { 
    isAuthenticated, 
    isAdminUtama, 
    isAdminAtk, 
    isAdminJp, 
    isAsn, 
    isUser 
};