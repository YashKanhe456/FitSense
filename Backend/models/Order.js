const mongoose = require('mongoose');

const ALLOWED_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1']
        },
        size: {
            type: String,
            default: ''
        }
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        orderItems: {
            type: [orderItemSchema],
            validate: {
                validator: (items) => Array.isArray(items) && items.length > 0,
                message: 'Order must contain at least one item'
            }
        },
        shippingAddress: {
            fullName: { type: String, required: true, trim: true },
            phone: { type: String, required: true, trim: true },
            address: { type: String, required: true, trim: true },
            city: { type: String, required: true, trim: true },
            state: { type: String, required: true, trim: true },
            pincode: { type: String, required: true, trim: true }
        },
        paymentMethod: {
            type: String,
            required: true,
            default: 'COD'
        },
        itemsPrice: {
            type: Number,
            required: true,
            default: 0
        },
        shippingPrice: {
            type: Number,
            required: true,
            default: 0
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0
        },
        isPaid: {
            type: Boolean,
            default: false
        },
        paidAt: {
            type: Date
        },
        orderStatus: {
            type: String,
            enum: ALLOWED_STATUSES,
            default: 'Pending'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Order', orderSchema);
module.exports.ALLOWED_STATUSES = ALLOWED_STATUSES;
