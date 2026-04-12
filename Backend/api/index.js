const dotenv = require('dotenv');

dotenv.config({ override: true });

const { connectDB } = require('../config/db');
const app = require('../app');
const { validateRuntimeEnv } = require('../utils/env');

const problems = validateRuntimeEnv();

if (problems.length > 0) {
    throw new Error(`Environment validation failed: ${problems.join(' ')}`);
}

connectDB().catch((error) => {
    console.error(`Database initialization failed: ${error.message}`);
});

module.exports = app;
