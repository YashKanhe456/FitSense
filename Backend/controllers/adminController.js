const asyncHandler = require('express-async-handler');
const { query } = require('../config/db');
const { mapOrder, mapProduct } = require('../utils/serializers');

const DASHBOARD_MONTHS = 6;
const RECENT_ORDER_LIMIT = 6;
const LOW_STOCK_LIMIT = 6;
const TOP_PRODUCT_LIMIT = 5;
const TOP_CUSTOMER_LIMIT = 5;

const getMonthBuckets = (months) => {
    const buckets = [];
    const current = new Date();
    current.setDate(1);
    current.setHours(0, 0, 0, 0);

    for (let index = months - 1; index >= 0; index -= 1) {
        const bucketDate = new Date(current.getFullYear(), current.getMonth() - index, 1);
        buckets.push({
            key: `${bucketDate.getFullYear()}-${String(bucketDate.getMonth() + 1).padStart(2, '0')}`,
            label: bucketDate.toLocaleString('en-IN', { month: 'short', year: 'numeric' }),
            revenue: 0,
            orders: 0
        });
    }

    return buckets;
};

const getDashboardStats = asyncHandler(async (req, res) => {
    const [
        totalProducts,
        totalCustomers,
        totalOrders,
        pendingOrders,
        processingOrders,
        deliveredOrders,
        cancelledOrders,
        lowStockProducts,
        recentOrders,
        revenueAgg,
        deliveredRevenueAgg,
        monthlySalesAgg,
        categoryBreakdownAgg,
        topProductsAgg,
        topCustomersAgg
    ] = await Promise.all([
        query('SELECT COUNT(*)::int AS count FROM products'),
        query(`SELECT COUNT(*)::int AS count FROM users WHERE role = 'customer'`),
        query('SELECT COUNT(*)::int AS count FROM orders'),
        query(`SELECT COUNT(*)::int AS count FROM orders WHERE order_status = 'Pending'`),
        query(`SELECT COUNT(*)::int AS count FROM orders WHERE order_status = 'Processing'`),
        query(`SELECT COUNT(*)::int AS count FROM orders WHERE order_status = 'Delivered'`),
        query(`SELECT COUNT(*)::int AS count FROM orders WHERE order_status = 'Cancelled'`),
        query(
            'SELECT * FROM products WHERE stock <= 5 ORDER BY stock ASC, updated_at DESC LIMIT $1',
            [LOW_STOCK_LIMIT]
        ),
        query(
            `SELECT o.*, u.id AS user_ref_id, u.name AS user_name, u.email AS user_email
             FROM orders o
             JOIN users u ON u.id = o.user_id
             ORDER BY o.created_at DESC
             LIMIT $1`,
            [RECENT_ORDER_LIMIT]
        ),
        query(`SELECT COALESCE(SUM(total_price), 0) AS revenue FROM orders WHERE order_status <> 'Cancelled'`),
        query(`SELECT COALESCE(SUM(total_price), 0) AS revenue FROM orders WHERE order_status = 'Delivered'`),
        query(`
            SELECT EXTRACT(YEAR FROM created_at)::int AS year,
                   EXTRACT(MONTH FROM created_at)::int AS month,
                   COALESCE(SUM(total_price), 0) AS revenue,
                   COUNT(*)::int AS orders
            FROM orders
            WHERE order_status <> 'Cancelled'
            GROUP BY 1, 2
            ORDER BY 1, 2
        `),
        query(`
            SELECT p.category AS id,
                   COALESCE(SUM(oi.price * oi.quantity), 0) AS revenue,
                   COALESCE(SUM(oi.quantity), 0)::int AS units_sold
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            JOIN products p ON p.id = oi.product_id
            WHERE o.order_status <> 'Cancelled'
            GROUP BY p.category
            ORDER BY revenue DESC
        `),
        query(`
            SELECT oi.product_id AS id,
                   oi.name,
                   oi.image,
                   COALESCE(SUM(oi.quantity), 0)::int AS units_sold,
                   COALESCE(SUM(oi.price * oi.quantity), 0) AS revenue
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE o.order_status <> 'Cancelled'
            GROUP BY oi.product_id, oi.name, oi.image
            ORDER BY units_sold DESC, revenue DESC
            LIMIT $1
        `, [TOP_PRODUCT_LIMIT]),
        query(`
            SELECT u.id,
                   u.name,
                   u.email,
                   COUNT(o.id)::int AS orders,
                   COALESCE(SUM(o.total_price), 0) AS revenue
            FROM users u
            JOIN orders o ON o.user_id = u.id
            WHERE o.order_status <> 'Cancelled'
            GROUP BY u.id, u.name, u.email
            ORDER BY revenue DESC
            LIMIT $1
        `, [TOP_CUSTOMER_LIMIT])
    ]);

    const monthlySales = getMonthBuckets(DASHBOARD_MONTHS);
    const salesMap = new Map(monthlySales.map((entry) => [entry.key, entry]));

    monthlySalesAgg.rows.forEach((entry) => {
        const key = `${entry.year}-${String(entry.month).padStart(2, '0')}`;
        const target = salesMap.get(key);

        if (target) {
            target.revenue = Number(entry.revenue);
            target.orders = entry.orders;
        }
    });

    const recentOrderIds = recentOrders.rows.map((order) => order.id);
    let recentOrdersData = [];

    if (recentOrderIds.length > 0) {
        const orderItemsResult = await query(
            'SELECT * FROM order_items WHERE order_id = ANY($1::uuid[])',
            [recentOrderIds]
        );
        const itemsByOrderId = new Map();
        orderItemsResult.rows.forEach((row) => {
            const current = itemsByOrderId.get(row.order_id) || [];
            current.push(row);
            itemsByOrderId.set(row.order_id, current);
        });

        recentOrdersData = recentOrders.rows.map((order) =>
            mapOrder(
                {
                    ...order,
                    user: { _id: order.user_ref_id, name: order.user_name, email: order.user_email }
                },
                itemsByOrderId.get(order.id) || []
            )
        );
    }

    res.json({
        success: true,
        data: {
            summary: {
                totalProducts: totalProducts.rows[0].count,
                totalCustomers: totalCustomers.rows[0].count,
                totalOrders: totalOrders.rows[0].count,
                pendingOrders: pendingOrders.rows[0].count,
                processingOrders: processingOrders.rows[0].count,
                deliveredOrders: deliveredOrders.rows[0].count,
                cancelledOrders: cancelledOrders.rows[0].count,
                lowStockCount: lowStockProducts.rows.length,
                totalRevenue: Number(revenueAgg.rows[0]?.revenue || 0),
                deliveredRevenue: Number(deliveredRevenueAgg.rows[0]?.revenue || 0)
            },
            lowStockProducts: lowStockProducts.rows.map(mapProduct),
            recentOrders: recentOrdersData,
            monthlySales,
            categoryBreakdown: categoryBreakdownAgg.rows.map((entry) => ({
                _id: entry.id,
                revenue: Number(entry.revenue),
                unitsSold: entry.units_sold
            })),
            topProducts: topProductsAgg.rows.map((entry) => ({
                _id: entry.id,
                name: entry.name,
                image: entry.image,
                unitsSold: entry.units_sold,
                revenue: Number(entry.revenue)
            })),
            topCustomers: topCustomersAgg.rows.map((entry) => ({
                _id: entry.id,
                name: entry.name,
                email: entry.email,
                orders: entry.orders,
                revenue: Number(entry.revenue)
            }))
        }
    });
});

module.exports = { getDashboardStats };
