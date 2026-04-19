const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { getAllowedOrigins, isAllowedOrigin } = require('./utils/env');

const app = express();

app.set('trust proxy', 1);

app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
);

const allowedOrigins = getAllowedOrigins();

app.use(
    cors({
        origin(origin, callback) {
            if (isAllowedOrigin(origin, allowedOrigins)) {
                return callback(null, true);
            }

            return callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        credentials: true
    })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

app.use(
    '/api/',
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 250,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            message: 'Too many requests. Please try again later.'
        }
    })
);

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'FitSense API is running',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, '../Frontend/dist');
    app.use(express.static(distPath));
    app.get(/^\/(?!api).*/, (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.json({
            success: true,
            message: 'FitSense API - Development Mode',
            docs: 'Frontend dev server: http://localhost:5173',
            health: '/api/health'
        });
    });
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
