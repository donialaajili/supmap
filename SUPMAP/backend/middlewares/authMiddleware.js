const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protectRoute = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant, accès non autorisé' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "Utilisateur introuvable, accès refusé" });
    }

    if (user.isActive === false) {
      return res.status(403).json({ error: "Compte désactivé, contactez le support." });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Erreur authMiddleware :", err.message);
    res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};
exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Non autorisé, veuillez vous connecter' });
};


const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Accès interdit : rôle insuffisant" });
    }
    next();
  };
};

const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé : admin uniquement.' });
  }
  next();
};


const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Erreur authentification :', err.message);
    res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};


// Export propre
module.exports = {
  protectRoute,
  authorizeAdmin,
  requireRole,
  authenticateToken // ✅ AJOUT ICI
};
