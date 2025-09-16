const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  latitude: Number,
  longitude: Number,
  sharedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Position', positionSchema);
