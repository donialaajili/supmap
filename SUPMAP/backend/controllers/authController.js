const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const transporter = require('../utils/email'); // Assurez-vous que le chemin est correct

// Générer un JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Vérification de la force du mot de passe
const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/;
  return regex.test(password);
};

exports.getProfile = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  res.status(200).json({
    id: req.user._id,
    email: req.user.email,
    username: req.user.username,
    telephone: req.user.telephone,
    // ✅ Ajout du loginMethod ici !
  });
};


exports.register = async (req, res) => {
  try {
    const { username, email, password, telephone } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    if (password.length < 12) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 12 caractères.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 chiffres

    const expiration = new Date(Date.now() + 15 * 60 * 1000); // valable 15 minutes

    const newUser = new User({
      username,
      email,
      password,
      telephone,
      isVerified: false, // au cas où ce n'est pas déjà dans le modèle
      emailVerificationCode: code,
      emailVerificationCodeExpires: expiration,
    });

    await newUser.save();

    // TODO: envoyer l'e-mail avec nodemailer ou ton service d'envoi de mail
    // Exemple basique :
    await transporter.sendMail({
      to: email,
      subject: 'Code de vérification de votre compte',
      html: ` <p>Bonjour ${username},</p>
    <p>Voici votre code de vérification : <strong>${code}</strong></p>
    <p>Ce code est valable pendant 15 minutes.</p>
    <p>
      Ou cliquez sur le lien suivant pour le valider :<br/>
      <a href="http://localhost:8100/verify-email?email=${email}">Vérifier mon compte</a>
    </p>`
    });

    res.status(201).json({ message: 'Inscription réussie. Vérifiez votre e-mail pour activer votre compte.' });


  } catch (err) {
    console.error("Erreur lors de l'inscription :", err);

    if (err.code === 11000) {
      if (err.keyPattern?.username) {
        return res.status(400).json({ error: "Nom d'utilisateur déjà pris." });
      }
      if (err.keyPattern?.email) {
        return res.status(400).json({ error: "Email déjà utilisé." });
      }
      return res.status(400).json({ error: "Utilisateur déjà existant." });
    }

    res.status(500).json({ error: "Erreur serveur." });
  }
};



exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password'); // On exclut le mot de passe

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      telephone: user.telephone,
      isActive: user.isActive,
      deactivatedAt: user.deactivatedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      loginMethod: req.user.loginMethod // ✅ Ajout du loginMethod ici !

    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
};



exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis.' });
    }

    const user = await User.findOne({ email });

    if (user.loginMethod === 'classic' && !user.isVerified) {
      return res.status(403).json({
        error: 'Veuillez vérifier votre adresse e-mail avant de vous connecter.'
      });
    }

    if (!user) {
      return res.status(400).json({ error: 'Email ou mot de passe incorrect.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Email ou mot de passe incorrect.' });
    }

    // Vérification de l'activation du compte
    if (!user.isVerified) {
      return res.status(403).json({
        error: 'Veuillez vérifier votre adresse e-mail avant de vous connecter.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: 'Ce compte est désactivé. Veuillez le restaurer'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        telephone: user.telephone
      }
    });

  } catch (err) {
    console.error('Erreur lors de la connexion :', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};






exports.restoreAccount = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis.' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Mot de passe incorrect.' });
    }

    if (user.isActive) {
      return res.status(400).json({ message: 'Ce compte est déjà actif.' });
    }

    const now = new Date();
    const daysSinceDeactivation = (now - user.deactivatedAt) / (1000 * 60 * 60 * 24);

    if (daysSinceDeactivation > 30) {
      return res.status(403).json({ error: 'Le compte a été désactivé depuis plus de 30 jours et ne peut plus être restauré.' });
    }

    user.isActive = true;
    user.deactivatedAt = null;
    await user.save();

    const token = generateToken(user._id);
    res.status(200).json({ message: 'Compte restauré avec succès.', token });

  } catch (err) {
    console.error('Erreur restauration de compte :', err);
    res.status(500).json({ error: 'Erreur serveur.', details: err.message });
  }
};

exports.verifyEmailCode = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email et code requis.' });
  }

  const user = await User.findOne({ email });

  if (!user || user.isVerified) {
    return res.status(400).json({ error: "Utilisateur invalide ou déjà vérifié." });
  }

  if (user.emailVerificationCode !== code) {
    return res.status(400).json({ error: "Code incorrect." });
  }

  if (user.emailVerificationCodeExpires < new Date()) {
    return res.status(400).json({ error: "Code expiré." });
  }

  user.isVerified = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationCodeExpires = undefined;
  await user.save();

  const token = generateToken(user._id);
  return res.status(200).json({
    message: "E-mail vérifié avec succès.",
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      telephone: user.telephone
    }
  });
};

exports.resendVerificationCode = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email requis." });
  }

  const user = await User.findOne({ email });

  if (!user || user.isVerified) {
    return res.status(400).json({ error: "Utilisateur introuvable ou déjà vérifié." });
  }

  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiration = new Date(Date.now() + 15 * 60 * 1000); // valable 15 minutes

  user.emailVerificationCode = newCode;
  user.emailVerificationCodeExpires = expiration;
  await user.save();

  await transporter.sendMail({
    to: email,
    subject: 'Nouveau code de vérification',
    html: `<p>Voici votre nouveau code de vérification :</p>
           <h2>${newCode}</h2>
           <p>Ce code est valable 15 minutes.</p>`
  });

  res.status(200).json({ message: "Nouveau code envoyé." });
};


