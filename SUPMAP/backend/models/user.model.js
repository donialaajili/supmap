const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Hook pre-save pour hacher le mot de passe si nécessaire
userSchema.pre('save', async function (next) {
  // Vérifie si le mot de passe est modifié
  if (this.isModified('password')) {
    // Vérifie si le mot de passe est déjà haché (en général, un hash bcrypt a une longueur d'environ 60 caractères)
    if (!this.password.startsWith('$2a$')) {
      // Hacher le mot de passe si ce n'est pas déjà un hash
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
