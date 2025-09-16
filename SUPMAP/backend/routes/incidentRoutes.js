/**
 * @swagger
 * tags:
 *   name: Incidents
 *   description: Gestion des signalements d'incidents routiers
 */

/**
 * @swagger
 * /incidents:
 *   post:
 *     summary: Signaler un nouvel incident
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - location
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [accident, bouchon, route_fermée, contrôle, obstacle]
 *                 example: accident
 *               location:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                     example: 48.8566
 *                   lon:
 *                     type: number
 *                     example: 2.3522
 *     responses:
 *       201:
 *         description: Incident signalé
 *       400:
 *         description: Données invalides
 */

/**
 * @swagger
 * /incidents:
 *   get:
 *     summary: Récupérer tous les incidents
 *     tags: [Incidents]
 *     responses:
 *       200:
 *         description: Liste des incidents
 */


/**
 * @swagger
 * /incidents/{id}:
 *   get:
 *     summary: Récupérer un incident par ID
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'incident
 *     responses:
 *       200:
 *         description: Incident trouvé
 *       404:
 *         description: Incident introuvable
 */





/**
 * @swagger
 * /incidents/{id}:
 *   patch:
 *     summary: Modifier un incident (propriétaire uniquement)
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'incident
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: bouchon
 *     responses:
 *       200:
 *         description: Incident mis à jour
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Incident introuvable
 */



/**
 * @swagger
 * /incidents/{id}:
 *   delete:
 *     summary: Supprimer un incident (propriétaire uniquement)
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'incident
 *     responses:
 *       200:
 *         description: Incident supprimé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Incident introuvable
 */


/**
 * @swagger
 * /incidents/{id}/confirm:
 *   patch:
 *     summary: Confirmer un incident signalé
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'incident
 *     responses:
 *       200:
 *         description: Confirmation enregistrée
 *       404:
 *         description: Incident introuvable
 */

/**
 * @swagger
 * /incidents/{id}/reject:
 *   patch:
 *     summary: Rejeter un incident signalé
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'incident
 *     responses:
 *       200:
 *         description: Rejet enregistré
 *       404:
 *         description: Incident introuvable
 */




const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const { protectRoute } = require('../middlewares/authMiddleware');
const incidentautomatiqueController = require('../controllers/incidentautomatiqueController');



// Création + lecture des incidents


router.get('/last', protectRoute, incidentController.getLastFiveIncidents);

router.post('/', protectRoute, incidentController.createIncident);
router.get('/', incidentController.getAllIncidents);
router.get('/:id', incidentController.getIncidentById);
router.post('/nearby-incidents-traffic', incidentController.getNearbyIncidentsAndTraffic);
// Update/delete protégé par ownership
router.patch('/:id', protectRoute, incidentController.updateIncident);
router.delete('/:id', protectRoute, incidentController.deleteIncident);


//router.post('/around',  incidentController.getIncidentsAroundUser);
//router.post('/Incidentauto',  incidentController.getNearbyIncidentsAndTraffic);
// Confirm/reject communautaire
router.patch('/:id/confirm', protectRoute, incidentController.confirmIncident);
router.post('/incidents/near-route', incidentController.getUserIncidentsNearRoute);

router.patch('/:id/reject', protectRoute, incidentController.rejectIncident);
router.get('/nearby-ip', protectRoute, incidentautomatiqueController.getIncidentsAroundIP);
module.exports = router;
