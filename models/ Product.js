const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    id: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    family: { type: Schema.Types.ObjectId, ref: 'ProductFamily' }
  });

  const Product = mongoose.model('product', productSchema);
  module.exports = Product;