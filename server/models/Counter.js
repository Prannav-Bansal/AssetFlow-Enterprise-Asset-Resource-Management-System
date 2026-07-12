const mongoose = require('mongoose');

/**
 * A simple named counter used to generate gap-free sequential numbers
 * (e.g. asset tags AF-0001, AF-0002...). Incrementing is atomic via
 * findOneAndUpdate with $inc, so concurrent requests never collide.
 */
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // counter name, e.g. "asset_tag"
  seq: { type: Number, default: 0 },
});

module.exports = mongoose.model('Counter', counterSchema);
