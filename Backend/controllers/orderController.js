const asyncHandler = require('express-async-handler');
const { query, withTransaction } = require('../config/db');
const { ALLOWED_STATUSES, mapOrder } = require('../utils/serializers');
const FREE_SHIPPING_THRESHOLD = 2999;
const STANDARD_SHIPPING = 149;

const getOrderItemsForOrders = async (orderIds, client = null) => {
    if (!orderIds.length) {
        return new Map();
    }

    const executor = client || { query };
    const result = await executor.query(
        'SELECT * FROM order_items WHERE order_id = ANY($1::uuid[]) ORDER BY order_id',
        [orderIds]
    );
    const itemsByOrderId = new Map();
    result.rows.forEach((row) => {
        const current = itemsByOrderId.get(row.order_id) || [];
        current.push(row);
        itemsByOrderId.set(row.order_id, current);
    });
    return itemsByOrderId;
};

const createOrder = asyncHandler(async (req, res) => {
    const { orderItems, shippingAddress, paymentMethod } = req.body;
    const createdOrder = await withTransaction(async (client) => {
        const resolvedItems = [];
        let itemsPrice = 0;

        for (const [index, item] of orderItems.entries()) {
            const productResult = await client.query(
                'SELECT * FROM products WHERE id = $1 LIMIT 1',
                [item.product]
            );
            const product = productResult.rows[0];

            if (!product) {
                res.status(404);
                throw new Error(`Product not found for item ${index + 1}`);
            }

            if (product.stock < item.quantity) {
                res.status(400);
                throw new Error(`Only ${product.stock} unit(s) left for ${product.name}`);
            }

            const normalizedSize = item.size?.trim() || '';
            if (product.sizes.length > 0 && !normalizedSize) {
                res.status(400);
                throw new Error(`Please select a size for ${product.name}`);
            }

            if (normalizedSize && product.sizes.length > 0 && !product.sizes.includes(normalizedSize)) {
                res.status(400);
                throw new Error(`Selected size is unavailable for ${product.name}`);
            }

            resolvedItems.push({
                product: product.id,
                name: product.name,
                image: product.image,
                price: Number(product.price),
                quantity: item.quantity,
                size: normalizedSize
            });

            itemsPrice += Number(product.price) * item.quantity;
        }

        const shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
        const totalPrice = itemsPrice + shippingPrice;

        const orderResult = await client.query(
            `INSERT INTO orders (
                user_id, shipping_full_name, shipping_phone, shipping_address, shipping_city,
                shipping_state, shipping_pincode, payment_method, items_price, shipping_price, total_price
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *`,
            [
                req.user._id,
                shippingAddress.fullName,
                shippingAddress.phone,
                shippingAddress.address,
                shippingAddress.city,
                shippingAddress.state,
                shippingAddress.pincode,
                paymentMethod || 'COD',
                itemsPrice,
                shippingPrice,
                totalPrice
            ]
        );
        const created = orderResult.rows[0];

        for (const item of resolvedItems) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, name, image, price, quantity, size)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [created.id, item.product, item.name, item.image, item.price, item.quantity, item.size]
            );

            await client.query(
                'UPDATE products SET stock = stock - $2, updated_at = NOW() WHERE id = $1',
                [item.product, item.quantity]
            );
        }

        return mapOrder(created, resolvedItems.map((item) => ({
            product_id: item.product,
            name: item.name,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
            size: item.size
        })));
    });

    res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: createdOrder
    });
});

const getMyOrders = asyncHandler(async (req, res) => {
    const ordersResult = await query(
        'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
        [req.user._id]
    );
    const itemsByOrderId = await getOrderItemsForOrders(ordersResult.rows.map((order) => order.id));
    const orders = ordersResult.rows.map((order) => mapOrder(order, itemsByOrderId.get(order.id) || []));

    res.json({
        success: true,
        data: orders
    });
});

const getOrders = asyncHandler(async (req, res) => {
    const ordersResult = await query(
        `SELECT o.*, u.id AS user_ref_id, u.name AS user_name, u.email AS user_email
         FROM orders o
         JOIN users u ON u.id = o.user_id
         ORDER BY o.created_at DESC`
    );
    const itemsByOrderId = await getOrderItemsForOrders(ordersResult.rows.map((order) => order.id));
    const orders = ordersResult.rows.map((order) =>
        mapOrder(
            {
                ...order,
                user: { _id: order.user_ref_id, name: order.user_name, email: order.user_email }
            },
            itemsByOrderId.get(order.id) || []
        )
    );

    res.json({
        success: true,
        data: orders
    });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    if (!ALLOWED_STATUSES.includes(status)) {
        res.status(400);
        throw new Error(`Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}`);
    }

    const updatedOrder = await withTransaction(async (client) => {
        const orderResult = await client.query('SELECT * FROM orders WHERE id = $1 LIMIT 1', [req.params.id]);
        const order = orderResult.rows[0];
        if (!order) {
            res.status(404);
            throw new Error('Order not found');
        }

        const itemsResult = await client.query('SELECT * FROM order_items WHERE order_id = $1', [req.params.id]);
        const previousStatus = order.order_status;

        if (previousStatus === 'Cancelled' && status !== 'Cancelled') {
            for (const item of itemsResult.rows) {
                const productResult = await client.query('SELECT * FROM products WHERE id = $1 LIMIT 1', [item.product_id]);
                const product = productResult.rows[0];
                if (!product) {
                    res.status(404);
                    throw new Error(`Product missing for ${item.name}`);
                }

                if (product.stock < item.quantity) {
                    res.status(400);
                    throw new Error(`Not enough stock to reopen ${item.name}`);
                }
            }

            for (const item of itemsResult.rows) {
                await client.query(
                    'UPDATE products SET stock = stock - $2, updated_at = NOW() WHERE id = $1',
                    [item.product_id, item.quantity]
                );
            }
        }

        if (previousStatus !== 'Cancelled' && status === 'Cancelled') {
            for (const item of itemsResult.rows) {
                await client.query(
                    'UPDATE products SET stock = stock + $2, updated_at = NOW() WHERE id = $1',
                    [item.product_id, item.quantity]
                );
            }
        }

        const updatedOrderResult = await client.query(
            `UPDATE orders
             SET order_status = $2,
                 is_paid = CASE WHEN $2 = 'Delivered' THEN TRUE WHEN $2 = 'Cancelled' THEN FALSE ELSE is_paid END,
                 paid_at = CASE
                    WHEN $2 = 'Delivered' AND paid_at IS NULL THEN NOW()
                    WHEN $2 = 'Cancelled' THEN NULL
                    ELSE paid_at
                 END,
                 updated_at = NOW()
             WHERE id = $1
             RETURNING *`,
            [req.params.id, status]
        );

        return mapOrder(updatedOrderResult.rows[0], itemsResult.rows);
    });

    res.json({
        success: true,
        message: 'Order status updated successfully',
        data: updatedOrder
    });
});

const getOrderById = asyncHandler(async (req, res) => {
    const orderResult = await query(
        `SELECT o.*, u.id AS user_ref_id, u.name AS user_name, u.email AS user_email
         FROM orders o
         JOIN users u ON u.id = o.user_id
         WHERE o.id = $1
         LIMIT 1`,
        [req.params.id]
    );
    const order = orderResult.rows[0];

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (order.user_id !== req.user._id && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to view this order');
    }

    const itemsResult = await query('SELECT * FROM order_items WHERE order_id = $1', [req.params.id]);

    res.json({
        success: true,
        data: mapOrder(
            {
                ...order,
                user: { _id: order.user_ref_id, name: order.user_name, email: order.user_email }
            },
            itemsResult.rows
        )
    });
});

module.exports = {
    createOrder,
    getMyOrders,
    getOrders,
    updateOrderStatus,
    getOrderById
};
