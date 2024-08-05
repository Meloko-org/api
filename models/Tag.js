const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tagSchema = new Schema({
    id: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    color: { type: String }
  });
  
  const Tag = mongoose.model('tag', tagSchema);
  module.exports = Tag;