const chalk = require('chalk');

module.exports = (err, req, res, next) => {
  console.error(chalk.red.bold("[ERREUR SERVEUR]"), chalk.yellow(err.stack));
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      details: err.details || "Erreur inconnue",
    },
  });
};
