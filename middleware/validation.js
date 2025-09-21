function isLoggedIn(req, res, next) {
    if (!req.session.user) return res.status(401).send('Log in required.');
    next();
}

function isAdmin(req, res, next) {
    if (req.session.user.role !== 'admin') return res.status(403).send('Access denied.');
    next();
}

module.exports = {isAdmin, isLoggedIn};
