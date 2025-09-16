require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Notification = require('../models/Notification');

// Remplace cet ID par un vrai ID d'utilisateur existant dans ta DB
const userId = '681bd48e1cb7bd9fd0be5407'; // <-- adapte ça

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("✅ Connecté à MongoDB");

    const newNotif = new Notification({
      user: userId,
      message: '🔔 Ceci est une notification test non lue',
      read: false,
      createdAt: new Date(),
    });

    await newNotif.save();
    console.log("✅ Notification insérée :", newNotif);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error("❌ Erreur :", err);
  });
