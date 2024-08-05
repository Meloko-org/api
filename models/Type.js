const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const typeSchema = new Schema({
    id: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    image: { type: String },
    description: { type: String }
  });
  
  const Type = mongoose.model('type', typeSchema);
  module.exports = Type;