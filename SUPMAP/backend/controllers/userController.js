const User = require('../models/User');
const bcrypt = require('bcrypt');


// Modifier le mot de passe

exports.changePassword = async (req, res) => {
    let { oldPassword, newPassword } = req.body;
  
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Champs manquants.' });
    }
  
    oldPassword = oldPassword.trim();
    newPassword = newPassword.trim();
  
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });
  
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) return res.status(400).json({ error: 'Ancien mot de passe incorrect.' });
  
      //  Mise à jour du mot de passe (sera hashé automatiquement par le hook pre('save'))
      user.password = newPassword;
      await user.save();
  
      res.json({ message: 'Mot de passe modifié avec succès.' });
  
    } catch (err) {
      console.error('❌ Erreur lors du changement de mot de passe :', err);
      res.status(500).json({ error: 'Erreur serveur', details: err.message });
    }
  };
// Désactiver le compte (soft delete)
exports.deactivateAccount = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      user.isActive = false;
      user.deactivatedAt = new Date(); // enregistre la date
      await user.save();
      res.json({ message: 'Compte désactivé avec succès.' });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur', details: err.message });
    }
  };

//  Supprimer le compte
exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: 'Compte supprimé définitivement.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
};

exports.updateProfile = (req, res) => {
  const userId = req.user.id;
  const updatedData = req.body;

  // À adapter selon ton modèle User
  User.findByIdAndUpdate(userId, updatedData, { new: true })
    .then(user => {
      if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
      res.json(user);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
    });
};


exports.sendFriendRequest = async (req, res) => {
  const targetUsername = req.params.targetUsername;

  // 🛑 Empêche l'utilisateur de s'ajouter lui-même
  if (req.user.username === targetUsername) {
    return res.status(400).json({ message: 'Impossible de s’ajouter soi-même en ami.' });
  }

  const targetUser = await User.findOne({ username: targetUsername });
  if (!targetUser) return res.status(404).json({ message: 'Utilisateur introuvable' });

  if (targetUser.friendRequests.includes(req.user.id)) {
    return res.status(400).json({ message: 'Demande déjà envoyée' });
  }

  targetUser.friendRequests.push(req.user.id);
  await targetUser.save();

  res.status(200).json({ message: `Demande d'ami envoyée à ${targetUsername}` });
};



exports.acceptFriendRequest = async (req, res) => {
  const requesterUsername = req.params.targetUsername;

  const user = await User.findById(req.user.id);
  const requester = await User.findOne({ username: requesterUsername });

  if (!requester) return res.status(404).json({ message: 'Demandeur introuvable' });

  if (!user.friendRequests.includes(requester._id)) {
    return res.status(400).json({ message: 'Aucune demande trouvée' });
  }

  // Ajout des deux côtés
  user.friendRequests = user.friendRequests.filter(id => id.toString() !== requester._id.toString());
  
  if (!user.friends.includes(requester._id)) user.friends.push(requester._id);
  if (!requester.friends.includes(user._id)) requester.friends.push(user._id);

  await user.save();
  await requester.save();

  res.status(200).json({ message: 'Ami ajouté' });
};

exports.getFriends = async (req, res) => {
  const user = await User.findById(req.user.id).populate('friends', 'username email');
  res.status(200).json({ friends: user.friends });
};



exports.getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friendRequests', 'username email');
    res.status(200).json({ requests: user.friendRequests });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
};


exports.removeFriend = async (req, res) => {
  const targetUsername = req.params.targetUsername;
  const friend = await User.findOne({ username: targetUsername });
  const user = await User.findById(req.user.id);

  if (!friend) return res.status(404).json({ message: 'Utilisateur introuvable' });

  user.friends = user.friends.filter(id => id.toString() !== friend._id.toString());
  friend.friends = friend.friends.filter(id => id.toString() !== user._id.toString());

  await user.save();
  await friend.save();

  res.status(200).json({ message: 'Ami retiré avec succès' });
};

exports.getFacebookSuggestions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends');

    const suggestions = await User.find({
      _id: { $nin: [...user.friends.map(f => f._id), user._id] },
      loginMethod: 'facebook'
    }).select('username email');

    res.status(200).json({ suggestions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};


exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.find().select('-password'); // On masque les mots de passe
      res.status(200).json({ users });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur', details: err.message });
    }
  };

  exports.getProfile = async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non autorisé' });
    }
  
    const user = await User.findById(req.user._id)
      .populate('friends', 'username email')
      .populate('blockedUsers', 'username email'); // 👈 AJOUT ICI
  
    res.status(200).json({
      id: user._id,
      email: user.email,
      username: user.username,
      telephone: user.telephone,
      firstName: user.firstName,
      friends: user.friends,
      blockedUsers: user.blockedUsers // 👈 AJOUT ICI
    });
  };

exports.unlinkGoogle = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    // Enlever les infos Google
    req.user.googleId = undefined;
    req.user.provider = req.user.provider === 'google' ? undefined : req.user.provider;

    await req.user.save();

    res.status(200).json({ message: 'Compte Google délié avec succès' });
  } catch (error) {
    console.error('Erreur lors du déliement Google:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.unlinkFacebook = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    // Enlever les infos Facebook
    req.user.facebookId = undefined;
    req.user.provider = req.user.provider === 'facebook' ? undefined : req.user.provider;

    await req.user.save();

    res.status(200).json({ message: 'Compte Facebook délié avec succès' });
  } catch (error) {
    console.error('Erreur lors du déliement Facebook:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};


exports.searchUserByIdOrName = async (req, res) => {
  const query = req.params.query;

  try {
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('username email');

    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Erreur de recherche', error: err.message });
  }
};



exports.blockUser = async (req, res) => {
  try {
    const targetUsername = req.params.targetUsername;

    const user = await User.findById(req.user.id);
    const targetUser = await User.findOne({ username: targetUsername });

    if (!targetUser) {
      return res.status(404).json({ message: 'Utilisateur à bloquer introuvable.' });
    }

    if (user.id === targetUser.id) {
      return res.status(400).json({ message: 'Impossible de se bloquer soi-même.' });
    }

    if (!user.blockedUsers.includes(targetUser._id)) {
      user.blockedUsers.push(targetUser._id);
      await user.save();
    }

    res.status(200).json({ message: `${targetUsername} bloqué avec succès.` });
  } catch (err) {
    console.error('Erreur lors du blocage :', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};


exports.refuseFriendRequest = async (req, res) => {
  try {
    const requesterUsername = req.params.targetUsername;
    const requester = await User.findOne({ username: requesterUsername });
    const user = await User.findById(req.user.id);

    if (!requester) return res.status(404).json({ message: 'Utilisateur introuvable' });

    // Supprimer la demande
    user.friendRequests = user.friendRequests.filter(
      id => id.toString() !== requester._id.toString()
    );
    await user.save();

    res.status(200).json({ message: `Demande de ${requesterUsername} refusée.` });
  } catch (err) {
    console.error('Erreur lors du refus de la demande :', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};


exports.unblockUser = async (req, res) => {
  try {
    const targetUsername = req.params.targetUsername;
    const user = await User.findById(req.user.id);
    const targetUser = await User.findOne({ username: targetUsername });

    if (!targetUser) {
      return res.status(404).json({ message: 'Utilisateur à débloquer introuvable.' });
    }

    user.blockedUsers = user.blockedUsers.filter(
      id => id.toString() !== targetUser._id.toString()
    );

    await user.save();

    res.status(200).json({ message: `${targetUsername} débloqué avec succès.` });
  } catch (err) {
    console.error('Erreur lors du déblocage :', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.getReverseGeocode = async (req, res) => {
  const { lat, lon } = req.query;
  const apiKey = process.env.TOMTOM_API_KEY;

  if (!lat || !lon) return res.status(400).send("Latitude et longitude requises");

  const url = `https://api.tomtom.com/search/2/reverseGeocode/${lat},${lon}.json?key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Erreur lors du reverse geocode :", error);
    res.status(500).send("Erreur serveur.");
  }
};