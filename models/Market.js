const mongoose = require('mongoose');

const marketSchema = mongoose.Schema({
    id: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    address: {
      address1: { type: String, required: true },
      address2: { type: String },
      postalCode: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      latitude: { type: Number },
      longitude: { type: Number }
    },
    openingHours: [{
      day: { type: Number, required: true },
      periods: [{
        openingTime: { type: String, required: true },
        closingTime: { type: String, required: true }
      }]
    }]
  });
  
  const Market = mongoose.model('markets', marketSchema);
  module.exports = Market;