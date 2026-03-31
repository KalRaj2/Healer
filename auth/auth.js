const jwt = require('jsonwebtoken');

const SECRET = "secret123";

function generateToken(user) {
    return jwt.sign(user, SECRET, { expiresIn: '1h' });
}

function verifyToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) return res.status(403).json({ error: "No token" });

    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(403).json({ error: "Invalid token" });
    }
}

module.exports = { generateToken, verifyToken };