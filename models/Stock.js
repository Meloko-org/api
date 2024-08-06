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
      type: Number, 
      required: true 
    },
    price: { 
      type: Number, 
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