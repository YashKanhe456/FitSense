const dotenv = require('dotenv');

dotenv.config({ override: true });

const { connectDB } = require('./config/db');
const app = require('./app');
const { validateRuntimeEnv } = require('./utils/env');

const startServer = async () => {
    const problems = validateRuntimeEnv();

    if (problems.length > 0) {
        throw new Error(`Environment validation failed: ${problems.join(' ')}`);
    }

    await connectDB();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
};

startServer().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
