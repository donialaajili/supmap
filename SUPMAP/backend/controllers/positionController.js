const Position = require('../models/Position');
const User = require('../models/User');

// Partager sa position avec un ami
exports.sharePosition = async (req, res) => {
  const { toUserId, latitude, longitude } = req.body;

  if (!toUserId || !latitude || !longitude) {
    return res.status(400).json({ message: 'Champs manquants (toUserId, latitude, longitude).' });
  }

  try {
    //  Vérifie si les deux sont amis
    const sender = await User.findById(req.user.id);
    if (!sender.friends.includes(toUserId)) {
      return res.status(403).json({ message: 'Vous ne pouvez partager qu’avec vos amis.' });
    }

    const position = await Position.create({
      from: req.user.id,
      to: toUserId,
      latitude,
      longitude
    });

    res.status(201).json({ message: 'Position partagée avec succès.', position });

  } catch (err) {
    console.error(' Erreur partage position :', err.message);
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
};

//  Récupérer la dernière position partagée par un ami
exports.getSharedPositions = async (req, res) => {
  const { friendId } = req.params;

  try {
    const position = await Position.findOne({
      from: friendId,
      to: req.user.id
    }).sort({ sharedAt: -1 }); // Dernière position partagée

    if (!position) {
      return res.status(404).json({ message: 'Aucune position partagée par cet ami.' });
    }

    res.status(200).json({ position });

  } catch (err) {
    console.error('Erreur récupération position :', err.message);
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
};
