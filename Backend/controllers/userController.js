const asyncHandler = require('express-async-handler');
const { query } = require('../config/db');
const { mapUser, mapOrder } = require('../utils/serializers');

const getUsers = asyncHandler(async (req, res) => {
    const conditions = [];
    const values = [];
    let parameterIndex = 1;

    if (req.query.role) {
        conditions.push(`role = $${parameterIndex}`);
        values.push(req.query.role);
        parameterIndex += 1;
    }

    if (req.query.search) {
        const query = req.query.search.trim();
        conditions.push(`(name ILIKE $${parameterIndex} OR email ILIKE $${parameterIndex})`);
        values.push(`%${query}%`);
        parameterIndex += 1;
    }

    let sql = 'SELECT id, name, email, role, created_at, updated_at FROM users';
    if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
    }
    sql += ' ORDER BY created_at DESC';

    const usersResult = await query(sql, values);

    const orderStatsResult = await query(`
        SELECT user_id,
               COUNT(*)::int AS orders,
               COALESCE(SUM(CASE WHEN order_status = 'Cancelled' THEN 0 ELSE total_price END), 0) AS total_spent,
               MAX(created_at) AS last_order_at
        FROM orders
        GROUP BY user_id
    `);

    const statsMap = new Map(orderStatsResult.rows.map((entry) => [entry.user_id, entry]));

    res.json({
        success: true,
        count: usersResult.rows.length,
        data: usersResult.rows.map((userRow) => {
            const user = mapUser(userRow);
            const stats = statsMap.get(user._id);

            return {
                ...user,
                metrics: {
                    orders: stats?.orders || 0,
                    totalSpent: Number(stats?.total_spent || 0),
                    lastOrderAt: stats?.last_order_at || null
                }
            };
        })
    });
});

const getUserById = asyncHandler(async (req, res) => {
    const userResult = await query(
        'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1 LIMIT 1',
        [req.params.id]
    );
    const userRow = userResult.rows[0];

    if (!userRow) {
        res.status(404);
        throw new Error('User not found');
    }

    const ordersResult = await query(
        `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`,
        [req.params.id]
    );
    const orderItemsResult = await query(
        `SELECT * FROM order_items WHERE order_id = ANY($1::uuid[])`,
        [ordersResult.rows.map((order) => order.id)]
    );
    const itemsByOrderId = new Map();
    orderItemsResult.rows.forEach((row) => {
        const current = itemsByOrderId.get(row.order_id) || [];
        current.push(row);
        itemsByOrderId.set(row.order_id, current);
    });
    const orders = ordersResult.rows.map((order) => mapOrder(order, itemsByOrderId.get(order.id) || []));
    const user = mapUser(userRow);
    const metrics = orders.reduce((accumulator, order) => {
        if (order.orderStatus !== 'Cancelled') {
            accumulator.totalSpent += order.totalPrice;
        }
        accumulator.orders += 1;
        return accumulator;
    }, { orders: 0, totalSpent: 0 });

    res.json({
        success: true,
        data: {
            ...user,
            metrics: {
                ...metrics,
                lastOrderAt: orders[0]?.createdAt || null
            },
            recentOrders: orders
        }
    });
});

module.exports = { getUsers, getUserById };
