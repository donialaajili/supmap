/**
 * @swagger
 * tags:
 *   name: Position
 *   description: Partage de position entre amis
 */

/**
 * @swagger
 * /position/share:
 *   post:
 *     summary: Partager sa position avec ses amis
 *     tags: [Position]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *                 example: 48.8566
 *               longitude:
 *                 type: number
 *                 example: 2.3522
 *     responses:
 *       200:
 *         description: Position partagée avec succès
 *       401:
 *         description: Non autorisé
 */

/**
 * @swagger
 * /position/from/{friendId}:
 *   get:
 *     summary: Obtenir la position d’un ami
 *     tags: [Position]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l’ami dont on veut la position
 *     responses:
 *       200:
 *         description: Position récupérée avec succès
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Utilisateur non ami
 *       404:
 *         description: Ami non trouvé ou aucune position
 */


const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const positionController = require('../controllers/positionController');

router.post('/share', auth.protectRoute, positionController.sharePosition);
router.get('/from/:friendId', auth.protectRoute, positionController.getSharedPositions);

module.exports = router;