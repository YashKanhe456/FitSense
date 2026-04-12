const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    if (err.name === 'MulterError' || err.message === 'Only image files are allowed.') {
        statusCode = 400;
    }
    
    // Global Error Format as requested in Phase 6
    res.status(statusCode).json({
        success: false,
        message: err.message,
        errors: err.errors || [], // Pass validation errors if any
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { notFound, errorHandler };
