const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lon: { type: Number, required: true }
}, { _id: false });

// Nouveau : schéma pour chaque point du tracé (latitude / longitude)
const pointSchema = new mongoose.Schema({
  lat: Number,
  lng: Number
}, { _id: false });

const routeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startPoint: { type: locationSchema, required: true },
  endPoint: { type: locationSchema, required: true },
  waypoints: [locationSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  estimatedTime: { type: Number, default: 0 }, // minutes
  distance: { type: Number, default: 0 }, // km
  optimized: { type: Boolean, default: false },
  includeTollRoads: { type: Boolean, default: true },
  costEstimate: { type: Number, default: 0 },
  qrCodeUrl: { type: String },
  coordinates: [pointSchema] // 🆕 le tracé de la route (polyline)
}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);