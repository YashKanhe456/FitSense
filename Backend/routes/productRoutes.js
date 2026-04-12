const express = require('express');
const router = express.Router();
const {
    getProducts,
    getFeaturedProducts,
    getProductById,
    getRelatedProducts,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { createProductSchema, updateProductSchema } = require('../validations/productValidation');

router.route('/featured').get(getFeaturedProducts);
router.route('/:id/related').get(getRelatedProducts);

router.route('/')
    .get(getProducts)
    .post(protect, admin, validate(createProductSchema), createProduct);

router.route('/:id')
    .get(getProductById)
    .put(protect, admin, validate(updateProductSchema), updateProduct)
    .delete(protect, admin, deleteProduct);

module.exports = router;
