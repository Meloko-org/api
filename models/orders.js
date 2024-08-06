const mongoose = require('mongoose');

const productDetailSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'stock' 
    },
    quantity: {
        type: Number,
        required: true
    },
    isConfirmed: {
        type: Boolean,
        default: null
    }
});

const orderDetailSchema = mongoose.Schema({
    products: productDetailSchema,
    withdreawMode: {
        type: String,
        required: true
    },
    market: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'market' 
    }
});

const orderSchema = mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users' 
    },
    details: orderDetailSchema,
    isWithdrawn: {
        type: Boolean,
        required: true
    }
},
{ timestamps: true }
);

const User = mongoose.model('users', userSchema);

module.exports = User;