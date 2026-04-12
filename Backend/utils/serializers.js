const PRODUCT_CATEGORIES = [
    'Shirts',
    'T-Shirts',
    'Jeans',
    'Pants',
    'Formal Wear',
    'Casual Wear'
];

const ALLOWED_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const toNumber = (value) => Number(value || 0);

const mapUser = (row) => ({
    _id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at
});

const mapProduct = (row) => ({
    _id: row.id,
    name: row.name,
    description: row.description,
    price: toNumber(row.price),
    category: row.category,
    image: row.image,
    stock: row.stock,
    isFeatured: row.is_featured,
    sizes: row.sizes || [],
    brand: row.brand,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    imageUrl: row.image
});

const mapOrderItem = (row) => ({
    product: row.product_id,
    name: row.name,
    image: row.image,
    price: toNumber(row.price),
    quantity: row.quantity,
    size: row.size || ''
});

const mapOrder = (orderRow, itemRows = []) => ({
    _id: orderRow.id,
    user: orderRow.user || orderRow.user_id,
    orderItems: itemRows.map(mapOrderItem),
    shippingAddress: {
        fullName: orderRow.shipping_full_name,
        phone: orderRow.shipping_phone,
        address: orderRow.shipping_address,
        city: orderRow.shipping_city,
        state: orderRow.shipping_state,
        pincode: orderRow.shipping_pincode
    },
    paymentMethod: orderRow.payment_method,
    itemsPrice: toNumber(orderRow.items_price),
    shippingPrice: toNumber(orderRow.shipping_price),
    totalPrice: toNumber(orderRow.total_price),
    isPaid: orderRow.is_paid,
    paidAt: orderRow.paid_at,
    orderStatus: orderRow.order_status,
    createdAt: orderRow.created_at,
    updatedAt: orderRow.updated_at
});

module.exports = {
    PRODUCT_CATEGORIES,
    ALLOWED_STATUSES,
    mapUser,
    mapProduct,
    mapOrder,
    mapOrderItem
};
