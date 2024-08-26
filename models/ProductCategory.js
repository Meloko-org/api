const mongoose = require('mongoose');

const productCategorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
},
{ timestamps: true }
);

const ProductCategory = mongoose.model('productcategory', productCategorySchema);

module.exports = ProductCategory;
