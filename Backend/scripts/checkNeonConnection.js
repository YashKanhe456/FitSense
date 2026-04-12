require('dotenv').config({ override: true });
const { connectDB, closeDB, query } = require('../config/db');

async function checkNeonConnection() {
    if (!process.env.POSTGRES_URL) {
        console.error('POSTGRES_URL is missing in Backend/.env');
        process.exit(1);
    }

    try {
        await connectDB();
        const result = await query('SELECT current_database() AS database_name, NOW() AS checked_at');
        console.log(`Neon connection successful: ${result.rows[0].database_name}`);
        await closeDB();
        process.exit(0);
    } catch (error) {
        console.error(`Neon connection failed: ${error.message}`);
        await closeDB().catch(() => {});
        process.exit(1);
    }
}

checkNeonConnection();
