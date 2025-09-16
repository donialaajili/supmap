/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Gestion de l'authentification
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Inscription utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: Azerty123!
 *               telephone:
 *                 type: string
 *                 example: "+33612345678"
 *     responses:
 *       201:
 *         description: Inscription réussie
 *       400:
 *         description: Champs manquants ou doublons
 */


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: Azerty123!
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       400:
 *         description: Erreur de validation ou mauvais identifiants
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Récupérer le profil utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données utilisateur
 *       401:
 *         description: Token invalide ou manquant
 */

/**
 * @swagger
 * /auth/restore-account:
 *   post:
 *     summary: Restaurer un compte désactivé (moins de 30 jours)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: Azerty123!
 *     responses:
 *       200:
 *         description: Compte restauré
 *       403:
 *         description: Trop tard, compte expiré
 *       404:
 *         description: Utilisateur introuvable
 */

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Démarrer l'authentification via Google OAuth
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirection vers Google
 */

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Callback OAuth Google
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirection vers /auth/success avec token en query
 */

/**
 * @swagger
 * /auth/facebook:
 *   get:
 *     summary: Démarrer l'authentification via Facebook OAuth
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirection vers Facebook
 */

/**
 * @swagger
 * /auth/facebook/callback:
 *   get:
 *     summary: Callback OAuth Facebook
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirection vers /auth/success avec token en query
 */

/**
 * @swagger
 * /auth/success:
 *   get:
 *     summary: Affiche le token JWT après un succès OAuth
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: JWT renvoyé après connexion OAuth
 *     responses:
 *       200:
 *         description: Authentification réussie avec le token
 *       400:
 *         description: Token manquant
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');
const authMiddleware = require('../middlewares/authMiddleware');
const User = require('../models/User');
const jwt = require('jsonwebtoken');


router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware.protectRoute, authController.getMe);
router.post('/restore-account', authController.restoreAccount);
router.post('/verify-code', authController.verifyEmailCode);
router.post('/resend-verification-code', authController.resendVerificationCode);

// ✅ Route de vérification par email
router.get('/verify-email', authController.verifyEmailCode);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => res.redirect(`/auth/success?token=${req.user.token}`)
);

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => res.redirect(`/auth/success?token=${req.user.token}`)
);

router.get('/success', async (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).json({ message: 'Token manquant dans l’URL' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id)
      .populate('suggestedFriends', 'username email');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const response = {
      message: 'Authentification réussie',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    };

    res.status(200).json(response);
  } catch (err) {
    console.error('Erreur de token :', err.message);
    res.status(401).json({ message: 'Token invalide', error: err.message });
  }
});

module.exports = router;