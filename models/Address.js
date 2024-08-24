const mongoose = require('mongoose');

const addressSchema = mongoose.Schema({
    address1: {
        type: String,
        required: true
    },
    address2: {
        type: String,
        default: null
    },
    postalCode: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    latitude: {
        type: mongoose.Types.Decimal128
    },
    longitude: {
        type: mongoose.Types.Decimal128
    }
},
{ timestamps: true });

module.exports = addressSchema