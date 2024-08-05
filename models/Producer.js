const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const producerSchema = new Schema({
    id: { type: Schema.Types.ObjectId, required: true },
    socialReason: { type: String, required: true },
    siren: { type: Number, required: true },
    shops: [{ type: Schema.Types.ObjectId, ref: 'Shop' }],
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    iban: { type: String, required: true, length: 34 },
    bic: { type: String, required: true, length: 11 },
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
  
  const Producer = mongoose.model('producer', producerSchema);
  module.exports = Producer;
  
  