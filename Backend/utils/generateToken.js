const jwt = require('jsonwebtoken');

const normalizeExpiresIn = (value) => {
    if (!value) {
        return '30d';
    }

    const trimmedValue = String(value).trim().replace(/^['"]|['"]$/g, '');
    return trimmedValue || '30d';
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: normalizeExpiresIn(process.env.JWT_EXPIRES_IN),
    });
};

module.exports = generateToken;
