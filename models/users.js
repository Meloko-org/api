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
        type: Number,
        default: null
    },
    longitude: {
        type: Number,
        default: null
    }
});

const favsearchSchema = mongoose.Schema({
    products: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'products',
        default: null,
    }],
    productsCats: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'products',
        default: null,
    }],
    tags: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'tags',
        default: null,
    }],
    address: addressSchema,
    isMyPosition: {
        type: Boolean,
        default: false,
    },
    radius: {
        type: Number,
        default: null,
    }
});


const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    clerkUUID: {
        type: String,
        required: true,
    },
    firstname: {
        type: String,
        default: null,
    },
    lastname: {
        type: String,
        default: null,
    },
    avatar: {
        type: String,
        default: null,
    },
    favSearch: [favsearchSchema],
},
{ timestamps: true }
);

const User = mongoose.model('users', userSchema);

module.exports = User;