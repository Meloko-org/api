const mongoose = require('mongoose');

const typeSchema = mongoose.Schema({
    id: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    image: { type: String },
    description: { type: String }
  });
  
  const Type = mongoose.model('types', typeSchema);
  module.exports = Type;