const mongoose = require('mongoose');
const periodSchema = require('./Period')

const openingHourSchema = mongoose.Schema({
  day: { type: Number, required: true },
  periods: [periodSchema]
},
{ timestamps: true })

module.exports = openingHourSchema