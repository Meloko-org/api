const mongoose = require('mongoose');

const stockSchema = mongoose.Schema({
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'product', 
      required: true 
    },
    shop: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'shop', 
      required: true 
    },
    stock: { 
      type: mongoose.Types.Decimal128, 
      required: true 
    },
    price: { 
      type: mongoose.Types.Decimal128, 
      required: true 
    },
    tags: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'tag' 
    }]
  },
  { timestamps: true }
);
  
  const Stock = mongoose.model('stocks', stockSchema);
  module.exports = Stock;