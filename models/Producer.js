const mongoose = require('mongoose');

const producerSchema = mongoose.Schema({
    socialReason: { type: String, required: true },
    siren: { type: Number, required: true, maxLength: 8 },
    shops: [{ type: Schema.Types.ObjectId, ref: 'shops' }],
    owner: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    iban: { type: String, required: true, maxLength: 34 },
    bic: { type: String, required: true, maxLength: 11 },
    address: {
      address1: { type: String, required: true },
      address2: { type: String },
      postalCode: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      latitude: { type: Number },
      longitude: { type: Number }
    }
  });
  
  const Producer = mongoose.model('producers', producerSchema);
  module.exports = Producer;
  
  