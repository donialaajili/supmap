const express = require('express');
const router = express.Router();
const passport = require('passport');
const { protectRoute, authorizeAdmin } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { ensureAuthenticated } = require('../middlewares/authMiddleware');
const { blockUser } = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware'); // ✅ AJOUT ICI



// Route réservée aux admins
router.get('/all', protectRoute, authorizeAdmin, userController.getAllUsers);

// Exemple : middleware pour vérifier le token
const authenticate = passport.authenticate('jwt', { session: false });

// Contrôleur (à créer si besoin)
const authController = require('../controllers/authController');


// Route GET /users/me (profil connecté)
router.get('/me', protectRoute, userController.getProfile);
// Route PUT /users/me (mise à jour du profil connecté)
router.put('/me', protectRoute, userController.updateProfile);

// Route GET /api/users/profile (ancienne, à retirer si non utilisée)
// router.get('/profile', authenticate, authController.getMe);
// router.put('/update', authenticate, userController.updateProfile); // à retirer

router.post('/change-password', authenticate, userController.changePassword);
router.post('/deactivate', authenticate, userController.deactivateAccount);
router.delete('/delete', authenticate, userController.deleteAccount);
router.post('/restore-account', authController.restoreAccount);
router.get('/friends', protectRoute, userController.getFriends);
router.get('/friend-requests', protectRoute, userController.getFriendRequests);
router.post('/friend-request/:targetUsername', protectRoute, userController.sendFriendRequest);
router.post('/friend-request/:targetUsername/accept', protectRoute, userController.acceptFriendRequest);
router.delete('/friend/:targetUsername', protectRoute, userController.removeFriend);
router.get('/suggestions-facebook', authMiddleware.protectRoute, userController.getFacebookSuggestions);
router.get('/search/:query', authenticateToken, userController.searchUserByIdOrName);
router.post('/block/:targetUsername', protectRoute, userController.blockUser);
router.delete('/friend-request/:targetUsername', protectRoute, userController.refuseFriendRequest);
router.post('/unblock/:targetUsername', protectRoute, userController.unblockUser);
router.get('/reverse-geocode', protectRoute, userController.getReverseGeocode);


// Délier compte Google
//router.put('/unlink/google', ensureAuthenticated, userController.unlinkGoogle);

// Délier compte Facebook
//router.put('/unlink/facebook', ensureAuthenticated, userController.unlinkFacebook);
router.get('/admin-only', protectRoute, authorizeAdmin, (req, res) => {
    res.json({ message: "Bienvenue, Admin !" });
  });

module.exports = router;
