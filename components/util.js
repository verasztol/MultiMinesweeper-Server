var Constants = require('./constants');
var logger = require('../log');

module.exports = {
  sendError: function(socket, eventId, code, message, logData) {
    var error = {
      code: code,
      msg: message
    };

    logger.warn(socket.id, eventId, error, logData);
    socket.emit(eventId, error);
  },
  sendShortError: function(socket, message, logData) {
    this.sendError(socket, Constants.EVENTS.userError, 400, message, logData);
  },
  getUserSocket: function(socket, io, playerId) {
    var playerSocket = null;
    if(io && playerId) {
      playerSocket = io.sockets.connected[playerId]
    }
    if(!playerSocket) {
      this.sendShortError(socket, "Enemy not found!", ["User socket not found", playerId])
    }
    return playerSocket;
  },
  manageError: function(socket, result) {
    if(!result) {
      this.sendShortError(socket, "Something went wrong!")
    }
    switch (result.error) {
      case Constants.ALREADY_MARKED:
        this.sendError(socket, Constants.EVENTS.gameWarn, 406, "This field is already marked!", result.data);
        break;
      case Constants.NOT_YOUR_TURN:
        this.sendError(socket, Constants.EVENTS.gameWarn, 406, "Not your turn!");
        break;
      case Constants.ALREADY_SHOOTED:
        this.sendError(socket, Constants.EVENTS.gameWarn, 406, "This field is already shotted!", result.data);
        break;
      case Constants.ALREADY_PLAYING:
        this.sendError(socket, Constants.EVENTS.gameWarn, 406, "Already playing", result.data);
        break;
      case Constants.USER_NOT_FOUND:
        this.sendShortError(socket, "User not found!", result.data);
        break;
      case Constants.NAME_REQUIRED:
        this.sendError(socket, Constants.EVENTS.gameWarn, 406, "User name is required!", result.data);
        break;
      case Constants.GAME_NOT_FOUND:
        this.sendShortError(socket, "Game not found!", result.data);
        break;
      case Constants.FIELD_ERROR:
        this.sendError(socket, Constants.EVENTS.gameWarn, 406, "The shooted field was not valid!", result.data);
        break;
    }
  }
};