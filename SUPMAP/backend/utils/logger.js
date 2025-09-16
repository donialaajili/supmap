const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info', // Niveau de log : info, error, warn, debug
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Format du timestamp
    format.printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new transports.Console(), // Affiche les logs dans la console
    new transports.File({ filename: 'logs/app.log' }), // Sauvegarde les logs dans un fichier
  ],
});

module.exports = logger;
