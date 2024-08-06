const mongoose = require('mongoose');
const addressSchema = require('./Address')

const producerSchema = mongoose.Schema({
    socialReason: { 
      type: String, 
      required: true 
    },
    siren: { 
      type: Number, 
      required: true 
    },
    shops: [{ 
      type: mongoose.Schema.Types.ObjectId, ref: 'shop' 
    }],
    owner: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'user', 
      required: true 
    },
    iban: { 
      type: String, 
      required: true, 
      length: 34 
    },
    bic: { 
      type: String, 
      required: true, 
      length: 11 
    },
    address: addressSchema
  },
  { timestamps: true }
);
  
  const Producer = mongoose.model('producers', producerSchema);
  module.exports = Producer;
  
  