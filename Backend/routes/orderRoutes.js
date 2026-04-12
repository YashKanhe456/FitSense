const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getOrders,
    updateOrderStatus,
    getOrderById
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { createOrderSchema, updateOrderStatusSchema } = require('../validations/orderValidation');

router.route('/')
    .post(protect, validate(createOrderSchema), createOrder)
    .get(protect, admin, getOrders);

router.route('/my')
    .get(protect, getMyOrders);

router.route('/:id')
    .get(protect, getOrderById);

router.route('/:id/status')
    .put(protect, admin, validate(updateOrderStatusSchema), updateOrderStatus);

module.exports = router;
