const mongoose = require('mongoose');
const addressSchema = require('./Address')
const clickCollectSchema = require('./ClickCollect')

const shopSchema = mongoose.Schema({
    producer: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'producer'
    },
    name: { 
      type: String, 
      required: true 
    },
    siret: { 
      type: String, 
      required: true,
      unique: true 
    },
    address: addressSchema,
    logo: { 
      type: String 
    },
    description: { 
      type: String,
      required: true 
    },
    photos: [{ 
      type: String 
    }],
    video: [{ 
      type: String 
    }],
    types: { 
      type: [mongoose.Schema.Types.ObjectId], 
      ref: 'type'
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