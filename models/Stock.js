const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stockSchema = new Schema({
    id: { type: Schema.Types.ObjectId, required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    shop: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    stock: { type: Number, required: true },
    price: { type: Number, required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }]
  });
  
  const Stock = mongoose.model('stock', stockSchema);
  module.exports = Stock;