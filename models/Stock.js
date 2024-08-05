const mongoose = require('mongoose');

const stockSchema = mongoose.Schema({
    id: { type: Schema.Types.ObjectId, required: true },
    product: { type: Schema.Types.ObjectId, ref: 'product', required: true },
    shop: { type: Schema.Types.ObjectId, ref: 'shop', required: true },
    stock: { type: Number, required: true },
    price: { type: Number, required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: 'tag' }]
  });
  
  const Stock = mongoose.model('stocks', stockSchema);
  module.exports = Stock;