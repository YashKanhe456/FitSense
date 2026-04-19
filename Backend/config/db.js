const { Pool } = require('pg');

let pool;

const createPool = () => {
    if (!process.env.POSTGRES_URL) {
        throw new Error('POSTGRES_URL is missing in the backend environment.');
    }

    return new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: process.env.POSTGRES_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : false
    });
};

const getPool = () => {
    if (!pool) {
        pool = createPool();
    }

    return pool;
};

const query = async (text, params = []) => {
    return getPool().query(text, params);
};

const withTransaction = async (callback) => {
    const client = await getPool().connect();

    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const initializeDatabase = async () => {
    await query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

    await query(`
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS products (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
            category TEXT NOT NULL CHECK (category IN ('Shirts', 'T-Shirts', 'Jeans', 'Pants', 'Formal Wear', 'Casual Wear')),
            image TEXT NOT NULL,
            stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
            is_featured BOOLEAN NOT NULL DEFAULT FALSE,
            sizes TEXT[] NOT NULL DEFAULT '{}',
            brand TEXT NOT NULL DEFAULT 'FitSense',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS orders (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            shipping_full_name TEXT NOT NULL,
            shipping_phone TEXT NOT NULL,
            shipping_address TEXT NOT NULL,
            shipping_city TEXT NOT NULL,
            shipping_state TEXT NOT NULL,
            shipping_pincode TEXT NOT NULL,
            payment_method TEXT NOT NULL DEFAULT 'COD',
            items_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
            shipping_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
            total_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
            is_paid BOOLEAN NOT NULL DEFAULT FALSE,
            paid_at TIMESTAMPTZ,
            order_status TEXT NOT NULL DEFAULT 'Pending' CHECK (order_status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS order_items (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
            name TEXT NOT NULL,
            image TEXT NOT NULL,
            price NUMERIC(10, 2) NOT NULL,
            quantity INTEGER NOT NULL CHECK (quantity >= 1),
            size TEXT NOT NULL DEFAULT ''
        )
    `);

    await query('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)');
    await query('CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured)');
    await query('CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC)');
    await query('CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status)');
    await query('CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC)');
    await query('CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)');
};

const connectDB = async () => {
    try {
        await initializeDatabase();
        const result = await query('SELECT current_database() AS database_name');
        console.log(`PostgreSQL connected: ${result.rows[0].database_name}`);
    } catch (error) {
        console.error(`PostgreSQL connection error: ${error.message}`);
        throw error;
    }
};

const closeDB = async () => {
    if (pool) {
        await pool.end();
    }
};

module.exports = {
    connectDB,
    query,
    withTransaction,
    closeDB
};
