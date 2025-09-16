// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protectRoute } = require('../middlewares/authMiddleware');

router.get('/last', protectRoute, notificationController.getLastNotifications);
router.get('/unreadCount',protectRoute, notificationController.getUnreadCount);
router.patch('/markAsRead',protectRoute, notificationController.markAllAsRead);

module.exports = router;

