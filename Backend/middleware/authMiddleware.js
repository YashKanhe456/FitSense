const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { query } = require('../config/db');
const { mapUser } = require('../utils/serializers');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userResult = await query(
                'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1 LIMIT 1',
                [decoded.id]
            );
            req.user = userResult.rows[0] ? mapUser(userResult.rows[0]) : null;

            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized. User no longer exists.');
            }

            return next();
        } catch (error) {
            res.status(401);

            if (error.name === 'TokenExpiredError') {
                throw new Error('Session expired. Please log in again.');
            }

            if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid token. Please log in again.');
            }

            throw new Error('Not authorized');
        }
    }

    res.status(401);
    throw new Error('Not authorized. No token provided.');
});

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }

    res.status(403);
    throw new Error('Access denied. Admin privileges required.');
};

module.exports = { protect, admin };
