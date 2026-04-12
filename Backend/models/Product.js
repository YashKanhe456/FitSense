const mongoose = require('mongoose');

const PRODUCT_CATEGORIES = [
    'Shirts',
    'T-Shirts',
    'Jeans',
    'Pants',
    'Formal Wear',
    'Casual Wear'
];

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative']
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: PRODUCT_CATEGORIES
        },
        image: {
            type: String,
            required: [true, 'Product image is required'],
            trim: true
        },
        stock: {
            type: Number,
            required: [true, 'Stock is required'],
            min: [0, 'Stock cannot be negative'],
            default: 0
        },
        isFeatured: {
            type: Boolean,
            default: false
        },
        sizes: {
            type: [String],
            default: []
        },
        brand: {
            type: String,
            trim: true,
            default: 'Patil Mens Wear'
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

productSchema.virtual('imageUrl')
    .get(function imageUrlGetter() {
        return this.image;
    })
    .set(function imageUrlSetter(value) {
        this.image = value;
    });

module.exports = mongoose.model('Product', productSchema);
module.exports.PRODUCT_CATEGORIES = PRODUCT_CATEGORIES;
