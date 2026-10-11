const asyncHandler = require('express-async-handler');
const { query } = require('../config/db');
const { mapProduct } = require('../utils/serializers');

const normalizeProductPayload = (payload) => ({
    ...payload,
    brand: payload.brand?.trim() || 'FitSense',
    sizes: Array.isArray(payload.sizes) ? payload.sizes.map((size) => size.trim()).filter(Boolean) : [],
    image: payload.image || payload.imageUrl
});

const getSortConfig = (sortKey) => {
    switch (sortKey) {
        case 'price-asc':
            return { price: 1, createdAt: -1 };
        case 'price-desc':
            return { price: -1, createdAt: -1 };
        case 'name-asc':
            return { name: 1 };
        case 'name-desc':
            return { name: -1 };
        case 'oldest':
            return { createdAt: 1 };
        case 'stock-desc':
            return { stock: -1, createdAt: -1 };
        default:
            return { isFeatured: -1, createdAt: -1 };
    }
};

const getProducts = asyncHandler(async (req, res) => {
    const conditions = [];
    const values = [];
    let parameterIndex = 1;

    if (req.query.search) {
        conditions.push(`name ILIKE $${parameterIndex}`);
        values.push(`%${req.query.search.trim()}%`);
        parameterIndex += 1;
    }

    if (req.query.category && req.query.category !== 'All') {
        conditions.push(`category = $${parameterIndex}`);
        values.push(req.query.category);
        parameterIndex += 1;
    }

    if (req.query.featured === 'true') {
        conditions.push('is_featured = TRUE');
    }

    if (req.query.inStock === 'true') {
        conditions.push('stock > 0');
    }

    if (req.query.priceMin || req.query.priceMax) {
        if (req.query.priceMin) {
            conditions.push(`price >= $${parameterIndex}`);
            values.push(Number(req.query.priceMin));
            parameterIndex += 1;
        }

        if (req.query.priceMax) {
            conditions.push(`price <= $${parameterIndex}`);
            values.push(Number(req.query.priceMax));
            parameterIndex += 1;
        }
    }

    let sql = 'SELECT * FROM products';
    if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
    }
    const sortConfig = getSortConfig(req.query.sort);
    const sortEntries = Object.entries(sortConfig)
        .map(([key, direction]) => `${key === 'isFeatured' ? 'is_featured' : key === 'createdAt' ? 'created_at' : key} ${direction === 1 ? 'ASC' : 'DESC'}`);
    sql += ` ORDER BY ${sortEntries.join(', ')}`;
    if (req.query.limit) {
        const parsedLimit = Number.parseInt(req.query.limit, 10);

        if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
            sql += ` LIMIT $${values.length + 1}`;
            values.push(parsedLimit);
        }
    }
    const result = await query(sql, values);
    const products = result.rows.map(mapProduct);

    res.json({
        success: true,
        count: products.length,
        data: products
    });
});

const getFeaturedProducts = asyncHandler(async (req, res) => {
    const limit = Number.parseInt(req.query.limit, 10) || 4;
    const result = await query(
        'SELECT * FROM products WHERE is_featured = TRUE ORDER BY created_at DESC LIMIT $1',
        [limit]
    );
    const products = result.rows.map(mapProduct);

    res.json({
        success: true,
        count: products.length,
        data: products
    });
});

const getProductById = asyncHandler(async (req, res) => {
    const result = await query('SELECT * FROM products WHERE id = $1 LIMIT 1', [req.params.id]);
    const product = result.rows[0];

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    res.json({
        success: true,
        data: mapProduct(product)
    });
});

const getRelatedProducts = asyncHandler(async (req, res) => {
    const productResult = await query('SELECT id, category FROM products WHERE id = $1 LIMIT 1', [req.params.id]);
    const product = productResult.rows[0];

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    const relatedProductsResult = await query(
        `SELECT * FROM products
         WHERE id <> $1 AND category = $2
         ORDER BY is_featured DESC, created_at DESC
         LIMIT 4`,
        [product.id, product.category]
    );
    const relatedProducts = relatedProductsResult.rows.map(mapProduct);

    res.json({
        success: true,
        count: relatedProducts.length,
        data: relatedProducts
    });
});

const createProduct = asyncHandler(async (req, res) => {
    const payload = normalizeProductPayload(req.body);
    const result = await query(
        `INSERT INTO products (name, description, price, category, image, stock, is_featured, sizes, brand)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
            payload.name,
            payload.description,
            payload.price,
            payload.category,
            payload.image,
            payload.stock,
            payload.isFeatured ?? false,
            payload.sizes,
            payload.brand
        ]
    );
    const product = mapProduct(result.rows[0]);

    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
    });
});

const updateProduct = asyncHandler(async (req, res) => {
    const existingProductResult = await query('SELECT * FROM products WHERE id = $1 LIMIT 1', [req.params.id]);
    const product = existingProductResult.rows[0];

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    const payload = normalizeProductPayload(req.body);
    const updatedProductResult = await query(
        `UPDATE products
         SET name = $2,
             description = $3,
             price = $4,
             category = $5,
             image = $6,
             stock = $7,
             is_featured = $8,
             sizes = $9,
             brand = $10,
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [
            req.params.id,
            payload.name ?? product.name,
            payload.description ?? product.description,
            payload.price ?? product.price,
            payload.category ?? product.category,
            payload.image ?? product.image,
            payload.stock ?? product.stock,
            payload.isFeatured ?? product.is_featured,
            payload.sizes ?? product.sizes,
            payload.brand ?? product.brand
        ]
    );
    const updatedProduct = mapProduct(updatedProductResult.rows[0]);

    res.json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct
    });
});

const deleteProduct = asyncHandler(async (req, res) => {
    const product = await query('SELECT id FROM products WHERE id = $1 LIMIT 1', [req.params.id]);

    if (product.rows.length === 0) {
        res.status(404);
        throw new Error('Product not found');
    }

    await query('DELETE FROM products WHERE id = $1', [req.params.id]);

    res.json({
        success: true,
        message: 'Product removed successfully'
    });
});

module.exports = {
    getProducts,
    getFeaturedProducts,
    getProductById,
    getRelatedProducts,
    createProduct,
    updateProduct,
    deleteProduct
};
