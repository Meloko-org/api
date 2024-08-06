const mongoose = require('mongoose');
const addressSchema = require('./Address')
const clickCollectSchema = require('./ClickCollect')

const shopSchema = mongoose.Schema({
    name: { 
      type: String, 
      required: true 
    },
    address: addressSchema,
    logo: { 
      type: String 
    },
    description: { 
      type: String 
    },
    photos: [{ 
      type: String 
    }],
    video: [{ 
      type: String 
    }],
    type: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'type', 
      required: true 
    },
    isOpen: { 
      type: Boolean, 
      default: false 
    },
    reopenDate: { 
      type: Date,
      default: null 
    },
    markets: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'market' 
    }],
    clickCollect: clickCollectSchema,
    likes: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'user' 
    }]
  },
  { timestamps: true }
);
  
  const Shop = mongoose.model('shops', shopSchema);
  module.exports = Shop;