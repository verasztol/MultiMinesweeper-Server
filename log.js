var winston = require('winston');
var fs = require('fs');
var path = require('path');

var logDirectory = path.join(__dirname, 'log');
// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

var logger = new (winston.Logger)({
  transports: [
    new winston.transports.File({name: "all-log", filename: 'log/all-logs.log', maxsize: 5000000, zippedArchive: true}),
    new winston.transports.File({name: "errors", filename: 'log/warnings.log', level: 'warning', maxsize: 2000000, zippedArchive: true }),
    new winston.transports.Console({name: "console", level: 'error' })
  ],
  exceptionHandlers: [
    new winston.transports.File({name: "exceptions", filename: 'log/exceptions.log', maxsize: 2000000, zippedArchive: true }),
    new winston.transports.Console()
  ],
  exitOnError: false
});

logger.exitOnError = false;

module.exports = logger;