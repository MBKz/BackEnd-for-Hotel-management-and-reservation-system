const winston = require('winston');
require('express-async-errors');

module.exports = function () {
  // file
  winston.add(winston.transports.File, { filename: 'logFile.log' })
  // uncaught
  winston.handleExceptions(
    new winston.transports.Console({ colorize: true, prettyPrint: true }),
    new winston.transports.File({ filename: 'uncaughtException.log' })
  );
  process.on('unhandledRejection', (ex) => {
    throw ex
  })
}
