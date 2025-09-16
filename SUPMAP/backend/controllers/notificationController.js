const Incident = require('../models/Incident'); // Utiliser le modèle d'incident

// Récupérer le nombre de notifications non lues pour un utilisateur
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ nécessite un middleware d'auth

    // Compte les incidents qui n'ont pas été lus par cet utilisateur
    const unreadCount = await Incident.countDocuments({
      readBy: { $nin: [userId] } // Vérifie si l'utilisateur n'est pas dans le tableau "readBy"
    });

    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur lors du comptage des notifications non lues' });
  }
};

// Marquer toutes les notifications comme lues pour un utilisateur
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    // Met à jour tous les incidents non lus par l'utilisateur pour les marquer comme lus
    await Incident.updateMany(
      { readBy: { $nin: [userId] } }, // Sélectionne les incidents non lus par l'utilisateur
      { $push: { readBy: userId } }    // Ajoute l'ID de l'utilisateur à la liste "readBy"
    );

    res.status(200).json({ message: 'Toutes les notifications ont été marquées comme lues' });

  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour des notifications' });
  }
};

// Récupérer les 5 dernières notifications non lues pour un utilisateur
const getLastNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    // Récupère les 5 dernières notifications, triées par date de création, non lues par l'utilisateur
    const notifications = await Incident.find({
      readBy: { $nin: [userId] } // Sélectionne les incidents non lus
    })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des notifications' });
  }
};

module.exports = {
  getUnreadCount,
  markAllAsRead,
  getLastNotifications,
};

