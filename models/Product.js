const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    id: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    family: { type: Schema.Types.ObjectId, ref: 'productFamily' }
  });

  const Product = mongoose.model('products', productSchema);
  module.exports = Product;