const mongoose = require('mongoose');
const addressSchema = require('./Address')

const producerSchema = mongoose.Schema({
    socialReason: { 
      type: String, 
      required: true 
    },
    siren: { 
      type: String, 
      required: true,
      unique: true 
    },
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
    address: { 
      type: addressSchema, 
      required: true, 
    }
  },
  { timestamps: true }
);
  
  const Producer = mongoose.model('producers', producerSchema);
  module.exports = Producer;
  
  