const validator = {
    isEmailValid: (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Vérifie le format email
      return emailRegex.test(email);
    },
  
    isPasswordStrong: (password) => {
      // Vérifie si le mot de passe contient au moins 8 caractères,
      // une majuscule, une minuscule, un chiffre et un caractère spécial
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return passwordRegex.test(password);
    },
  
    isNonEmptyString: (str) => {
      // Vérifie que la chaîne n'est pas vide ou uniquement composée d'espaces
      return typeof str === 'string' && str.trim().length > 0;
    },
  };
  
  module.exports = validator;
  