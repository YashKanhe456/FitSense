const Joi = require('joi');

const orderItemSchema = Joi.object({
    product: Joi.string().trim().required(),
    quantity: Joi.number().integer().min(1).required(),
    size: Joi.string().allow('').default('')
});

const createOrderSchema = Joi.object({
    orderItems: Joi.array().items(orderItemSchema).min(1).required(),
    shippingAddress: Joi.object({
        fullName: Joi.string().trim().min(3).required(),
        phone: Joi.string().trim().min(10).required(),
        address: Joi.string().trim().min(10).required(),
        city: Joi.string().trim().required(),
        state: Joi.string().trim().required(),
        pincode: Joi.string().trim().min(6).required()
    }).required(),
    paymentMethod: Joi.string().valid('COD').default('COD'),
    totalPrice: Joi.any().strip()
});

const updateOrderStatusSchema = Joi.object({
    status: Joi.string().valid('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled').required()
});

module.exports = {
    createOrderSchema,
    updateOrderStatusSchema
};
