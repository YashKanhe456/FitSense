const Joi = require('joi');
const { PRODUCT_CATEGORIES } = require('../utils/serializers');

const sizeSchema = Joi.array().items(Joi.string().trim().min(1)).default([]);

const createProductSchema = Joi.object({
    name: Joi.string().trim().min(3).required(),
    description: Joi.string().trim().min(20).required(),
    category: Joi.string().valid(...PRODUCT_CATEGORIES).required(),
    brand: Joi.string().trim().allow('').default('FitSense'),
    price: Joi.number().min(0).required(),
    image: Joi.string().trim().required(),
    stock: Joi.number().integer().min(0).required(),
    isFeatured: Joi.boolean().default(false),
    sizes: sizeSchema
});

const updateProductSchema = Joi.object({
    name: Joi.string().trim().min(3),
    description: Joi.string().trim().min(20),
    category: Joi.string().valid(...PRODUCT_CATEGORIES),
    brand: Joi.string().trim().allow(''),
    price: Joi.number().min(0),
    image: Joi.string().trim(),
    stock: Joi.number().integer().min(0),
    isFeatured: Joi.boolean(),
    sizes: sizeSchema
}).min(1);

const productSchema = createProductSchema;

module.exports = { productSchema, createProductSchema, updateProductSchema };
