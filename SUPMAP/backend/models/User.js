const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  firstName: { type: String }, // 👈 Ajouté ici
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Optionnel si OAuth
  googleId: { type: String, default: null },
  facebookId: { type: String, default: null },
  telephone: {
    type: String,
    required: false,
    validate: {
      validator: function(v) {
        return /^(\+?\d{1,3}[- ]?)?\d{10}$/.test(v); // format basique
      },
      message: props => `${props.value} n'est pas un numéro valide !`
    }
  },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: String },
  emailVerificationCodeExpires: { type: Date },
  deactivatedAt: { type: Date, default: null },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  loginMethod: {
    type: String,
    enum: ['facebook', 'google', 'classic'],
    default: 'classic'
  },
  suggestedFriends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

// Hachage automatique du mot de passe avant sauvegarde
userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Vérification du mot de passe
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
