const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // il y a 30 jours
    const result = await User.deleteMany({
      isActive: false,
      deactivatedAt: { $lte: cutoff }
    });

    console.log(`${result.deletedCount} comptes supprimés.`);
    process.exit();
  })
  .catch(err => {
    console.error("Erreur de connexion MongoDB :", err);
    process.exit(1);
  });
