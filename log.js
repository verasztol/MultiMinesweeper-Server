var winston = require('winston');
var fs = require('fs');
var path = require('path');
var firebase = require("firebase-admin");
var serviceAccount = require("./key.json");
var util = require('util');

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://multi-minesweeper.firebaseio.com"
});
var database = firebase.database();

var FirebaseLogger = winston.transports.FirebaseLogger = function (options) {
  options = options || {};
  this.name = options.name || 'firebaseLogger';
  this.level = options.level || 'info';
  this.logFolder = options.logFolder || 'logs';
};

util.inherits(FirebaseLogger, winston.Transport);

FirebaseLogger.prototype.log = function (level, msg, meta, callback) {
  var date = new Date();
  var logFolder = this.logFolder + "/" + date.getFullYear() + "-" + date.getMonth() + 1 + "-" + date.getDate();
  var logsRef = database.ref(logFolder).push();
  logsRef.set({
    level: level,
    message: msg,
    meta: meta,
    timestamp: Date.now()
  }, function(error) {
    if(error) {
      callback(error, true);
    }
  });
};

var logDirectory = path.join(__dirname, 'log');
// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

var logger = new (winston.Logger)({
  transports: [
    new winston.transports.File({name: "all-log", filename: 'log/all-logs.log', maxsize: 5000000, zippedArchive: true}),
    new winston.transports.File({name: "errors", filename: 'log/warnings.log', level: 'warning', maxsize: 2000000, zippedArchive: true }),
    new winston.transports.Console({name: "console", level: 'error' }),
    new winston.transports.FirebaseLogger({name: "firebaseLogger", logFolder: "logs"})
  ],
  exceptionHandlers: [
    new winston.transports.File({name: "exceptions", filename: 'log/exceptions.log', maxsize: 2000000, zippedArchive: true }),
    new winston.transports.Console(),
    new winston.transports.FirebaseLogger({name: "firebaseLoggerException", logFolder: "exceptions"})
  ],
  exitOnError: false
});

logger.exitOnError = false;

module.exports = logger;