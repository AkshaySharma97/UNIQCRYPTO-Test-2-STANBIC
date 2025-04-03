const jwt = require('jsonwebtoken');
const { isBlacklisted } = require('../services/authService');
const User = require('../models/User');

exports.isAdmin = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Unauthorized - No token provided." });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const uuid = decoded.uuid;
    const user = await User.findOne({ where: { uuid } });
    
    if (user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
    next();
};

const failedLogins = new Map(); 

exports.logFailedAttempt = (userId) => {
    const attempts = failedLogins.get(userId) || { count: 0, lastAttempt: Date.now() };
    attempts.count += 1;
    failedLogins.set(userId, attempts);
};

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Unauthorized - No token provided." });
    }

    const token = authHeader.split(' ')[1];

    // Check if token is blacklisted
    if (isBlacklisted(token)) {
        return res.status(403).json({ message: "Token is blacklisted. Please log in again." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};