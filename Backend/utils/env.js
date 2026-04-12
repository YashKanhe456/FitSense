const normalizeUrl = (value) => {
    if (!value) {
        return '';
    }

    return value.replace(/\/+$/, '');
};

const getAllowedOrigins = () => {
    const origins = new Set([
        'http://localhost:5173',
        'http://127.0.0.1:5173'
    ]);

    if (process.env.FRONTEND_URL) {
        origins.add(normalizeUrl(process.env.FRONTEND_URL));
    }

    if (process.env.VERCEL_URL) {
        origins.add(normalizeUrl(`https://${process.env.VERCEL_URL}`));
    }

    return [...origins];
};

const isCloudinaryConfigured = () => (
    Boolean(process.env.CLOUDINARY_CLOUD_NAME)
    && Boolean(process.env.CLOUDINARY_API_KEY)
    && Boolean(process.env.CLOUDINARY_API_SECRET)
);

const validateRuntimeEnv = () => {
    const problems = [];
    const isProduction = process.env.NODE_ENV === 'production';

    if (!process.env.POSTGRES_URL) {
        problems.push('POSTGRES_URL is required.');
    }

    if (!process.env.JWT_SECRET) {
        problems.push('JWT_SECRET is required.');
    } else if (isProduction && process.env.JWT_SECRET.length < 32) {
        problems.push('JWT_SECRET must be at least 32 characters in production.');
    }

    if (isProduction && !process.env.FRONTEND_URL && !process.env.VERCEL_URL) {
        problems.push('FRONTEND_URL or VERCEL_URL must be set in production for CORS.');
    }

    return problems;
};

module.exports = {
    getAllowedOrigins,
    isCloudinaryConfigured,
    normalizeUrl,
    validateRuntimeEnv
};
