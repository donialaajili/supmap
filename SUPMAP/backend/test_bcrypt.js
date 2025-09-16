const bcrypt = require('bcrypt');

const plainPassword = "20032023"; // Mot de passe en clair attendu
const storedHash = "$2b$10$lKvDTAS0j3bBpMBi.VERaeQgg.cm8OSDdUHgNRLVwpFRBA6AK2QJe"; // Hash obtenu à l'étape précédente

bcrypt.compare(plainPassword, storedHash, (err, result) => {
  if (err) {
    console.error("Erreur bcrypt.compare :", err);
  } else {
    console.log("Mot de passe valide ?", result); // Devrait afficher 'true' si le mot de passe correspond
  }
});








