const mongoose = require('mongoose');

const roleSchema = mongoose.Schema({
    name: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String, 
      required: true 
    }
  },
  { timestamps: true }
);
  
  const Role = mongoose.model('roles', roleSchema);
  module.exports = Role;