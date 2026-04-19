require('dotenv').config({ override: true });
const bcrypt = require('bcryptjs');
const { connectDB, query, closeDB, withTransaction } = require('./config/db');

const products = [
    {
        name: 'Premium Oxford White Shirt',
        description: 'A crisp premium cotton Oxford shirt tailored for office meetings, polished dinners, and easy everyday layering.',
        category: 'Shirts',
        brand: 'FitSense',
        price: 1299,
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        stock: 45,
        image: 'shirt_white',
        isFeatured: true
    },
    {
        name: 'Casual Linen Check Shirt',
        description: 'A breathable linen-blend check shirt built for weekend plans, travel days, and smart casual styling.',
        category: 'Casual Wear',
        brand: 'FitSense',
        price: 1149,
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 20,
        image: 'shirt_check',
        isFeatured: true
    },
    {
        name: 'Classic White Crew-Neck T-Shirt',
        description: 'A heavyweight crew-neck tee with a clean finish, soft hand feel, and an easy fit that works with jeans or chinos.',
        category: 'T-Shirts',
        brand: 'FitSense',
        price: 499,
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        stock: 100,
        image: 'tshirt_white',
        isFeatured: true
    },
    {
        name: 'Weekend Relaxed Fit Tee',
        description: 'An easy relaxed-fit T-shirt designed for off-duty comfort with a modern drape and breathable cotton jersey.',
        category: 'Casual Wear',
        brand: 'FitSense',
        price: 649,
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 80,
        image: 'tshirt_white',
        isFeatured: false
    },
    {
        name: 'Classic Slim Chino Pants',
        description: 'Stretch chino pants with a clean taper, all-day comfort, and the versatility to move from work to dinner.',
        category: 'Pants',
        brand: 'FitSense',
        price: 1599,
        sizes: ['28', '30', '32', '34', '36'],
        stock: 40,
        image: 'pants_chino',
        isFeatured: true
    },
    {
        name: 'Dark Indigo Slim Fit Jeans',
        description: 'Premium stretch denim in a deep indigo wash for a smarter jeans look that still feels easy to wear.',
        category: 'Jeans',
        brand: 'FitSense',
        price: 1799,
        sizes: ['28', '30', '32', '34', '36'],
        stock: 55,
        image: 'jeans_dark',
        isFeatured: true
    },
    {
        name: 'Light Wash Straight Jeans',
        description: 'Relaxed straight-fit jeans in a light wash with a laid-back finish that pairs perfectly with tees and overshirts.',
        category: 'Jeans',
        brand: 'FitSense',
        price: 1499,
        sizes: ['30', '32', '34'],
        stock: 30,
        image: 'jeans_light',
        isFeatured: false
    },
    {
        name: 'Navy Blue Formal Blazer',
        description: 'A sharp single-breasted blazer cut in a rich navy tone for presentations, weddings, and formal evenings.',
        category: 'Formal Wear',
        brand: 'FitSense',
        price: 4999,
        sizes: ['38', '40', '42'],
        stock: 18,
        image: 'blazer_navy',
        isFeatured: true
    },
    {
        name: 'Emerald Occasion Bandhgala',
        description: 'A rich structured occasion jacket that brings a premium formal edge to festive dinners and engagement events.',
        category: 'Formal Wear',
        brand: 'FitSense',
        price: 6299,
        sizes: ['M', 'L', 'XL'],
        stock: 12,
        image: 'nehru_emerald',
        isFeatured: false
    },
    {
        name: 'Classic Charcoal Evening Suit',
        description: 'A sleek formalwear option for stage presentations, ceremonies, and important events where a polished impression matters.',
        category: 'Formal Wear',
        brand: 'FitSense',
        price: 8999,
        sizes: ['38', '40', '42'],
        stock: 9,
        image: 'indo_western',
        isFeatured: true
    },
    {
        name: 'Modern Smart Casual Overshirt',
        description: 'A polished overshirt-inspired layer made for travel days, casual Fridays, and minimalist modern styling.',
        category: 'Casual Wear',
        brand: 'FitSense',
        price: 2199,
        sizes: ['M', 'L', 'XL'],
        stock: 15,
        image: 'kurta_navy',
        isFeatured: false
    },
    {
        name: 'Signature Celebration Jacket',
        description: 'A statement festive jacket with premium detailing for college presentations, ceremonies, and special family events.',
        category: 'Formal Wear',
        brand: 'FitSense',
        price: 7599,
        sizes: ['S', 'M', 'L'],
        stock: 8,
        image: 'sherwani_gold',
        isFeatured: false
    }
];

const importData = async () => {
    try {
        await connectDB();
        await withTransaction(async (client) => {
            await client.query('DELETE FROM order_items');
            await client.query('DELETE FROM orders');
            await client.query('DELETE FROM products');
            await client.query('DELETE FROM users');

            const hashedPassword = await bcrypt.hash('Admin@1234', 10);
            const adminResult = await client.query(
                `INSERT INTO users (name, email, password, role)
                 VALUES ($1, $2, $3, $4)
                 RETURNING email`,
                ['FitSense Admin', 'admin@fitsense.com', hashedPassword, 'admin']
            );
            console.log(`Admin created: ${adminResult.rows[0].email}`);

            for (const product of products) {
                await client.query(
                    `INSERT INTO products (name, description, category, brand, price, sizes, stock, image, is_featured)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [
                        product.name,
                        product.description,
                        product.category,
                        product.brand,
                        product.price,
                        product.sizes,
                        product.stock,
                        product.image,
                        product.isFeatured
                    ]
                );
            }
        });

        const productCount = await query('SELECT COUNT(*)::int AS count FROM products');
        console.log(`${productCount.rows[0].count} demo products seeded`);
        console.log('\nDatabase seeded successfully');
        console.log('Admin: admin@fitsense.com');
        console.log('Password: Admin@1234\n');
        await closeDB();
        process.exit(0);
    } catch (error) {
        console.error('\nSeeder error:', error.message);
        await closeDB().catch(() => {});
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await connectDB();
        await withTransaction(async (client) => {
            await client.query('DELETE FROM order_items');
            await client.query('DELETE FROM orders');
            await client.query('DELETE FROM products');
            await client.query('DELETE FROM users');
        });

        console.log('All data destroyed successfully');
        await closeDB();
        process.exit(0);
    } catch (error) {
        console.error('Destroy error:', error.message);
        await closeDB().catch(() => {});
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
