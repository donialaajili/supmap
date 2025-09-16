const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['accident', 'danger', 'bouchon', 'police', 'route_fermee', 'obstacle'], // Validation stricte
  },
  description: { type: String },
  location: {
    type: { type: String, default: 'Point' }, // Définit le type comme "Point"
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  confirmedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rejectedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Ajout du statut de l'incident
  status: {
    type: String,
    enum: ['signalé', 'en cours', 'résolu'],
    default: 'signalé'
  },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Ajout d'un index géospatial 2dsphere
incidentSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Incident', incidentSchema);

