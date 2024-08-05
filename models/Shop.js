const mongoose = require('mongoose');

const shopSchema = mongoose.Schema({
    id: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    address: {
      address1: { type: String, required: true },
      address2: { type: String },
      postalCode: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      latitude: { type: Number },
      longitude: { type: Number }
    },
    logo: { type: String },
    description: { type: String },
    photos: [{ type: String }],
    video: [{ type: String }],
    type: { type: Schema.Types.ObjectId, ref: 'type', required: true },
    isOpen: { type: Boolean, default: false },
    reopenDate: { type: Date, default: null },
    markets: [{ type: Schema.Types.ObjectId, ref: 'market' }],
    clickCollect: {
      instructions: { type: String },
      openingHours: [{
        day: { type: Number },
        periods: [{ 
          openingTime: { type: String },
          closingTime: { type: String }
        }]
      }]
    },
    likes: [{ type: Schema.Types.ObjectId, ref: 'user' }]
  });
  
  const Shop = mongoose.model('shops', shopSchema);
  module.exports = Shop;