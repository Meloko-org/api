const mongoose = require('mongoose');

const tagSchema = mongoose.Schema({
    id: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    color: { type: String }
  });
  
  const Tag = mongoose.model('tags', tagSchema);
  module.exports = Tag;