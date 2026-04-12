require('dotenv').config({ override: true });
const mongoose = require('mongoose');

async function checkAtlasConnection() {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        console.error('MONGO_URI is missing in Backend/.env');
        process.exit(1);
    }

    if (!mongoUri.startsWith('mongodb+srv://')) {
        console.warn('Warning: MONGO_URI does not look like a MongoDB Atlas SRV connection string.');
    }

    try {
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000
        });
        console.log(`Atlas connection successful: ${conn.connection.host}`);
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error(`Atlas connection failed: ${error.message}`);
        process.exit(1);
    }
}

checkAtlasConnection();
