const sanitizeHtml = require('sanitize-html');
const mongoose = require('mongoose');
const xss = require('xss');

// Supprime les caractères dangereux pour MongoDB
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/\$|\./g, '');
}

// Nettoyage HTML (contre XSS)
function sanitizeHtmlInput(input) {
  return xss(input, {
    whiteList: {}, // Aucune balise HTML autorisée
    stripIgnoreTag: true, // Supprime les balises inconnues
    stripIgnoreTagBody: ['script'], // Supprime aussi le contenu des balises script
  });
}

// Vérifie si c’est une chaîne non vide (avec longueur min/max optionnelle)
function validateString(input, min = 1, max = 255) {
  return typeof input === 'string' && input.trim().length >= min && input.trim().length <= max;
}

// Vérifie un ObjectId MongoDB valide
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

module.exports = {
  sanitizeInput,
  sanitizeHtmlInput,
  validateString,
  isValidObjectId
};