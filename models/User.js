const mongoose = require('mongoose');
const addressSchema = require('./Address')

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
    isMyPosition: {
        type: Boolean,
        default: false,
    },
    radius: {
        type: Number,
        default: null,
    },
    address: addressSchema,
},
{ timestamps: true });


const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    clerkUUID: {
        type: String,
        required: true,
        unique: true,
    },
    roles: { 
      type: [mongoose.Schema.Types.ObjectId], 
      ref: 'role', 
      required: true 
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