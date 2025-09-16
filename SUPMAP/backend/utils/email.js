// utils/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,       // exemple : "votreadresse@gmail.com"
    pass: process.env.EMAIL_PASS        // mot de passe d'application (voir plus bas)
  }
});

module.exports = transporter;