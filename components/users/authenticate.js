var UserHandler = require('./user.handler.js');
var GameHandler = require('../game/game.handler.js');
var Util = require('../util.js');
var logger = require('../../log');
var Constants = require('../constants');

module.exports = {
  login: function(socket, data) {
    var userName = data.userName;

    if (userName) {
      var user = UserHandler.addNewUser(socket.id, userName);

      if (user && user.publicData && user.logData) {
        logger.info("user added", user.logData);
        socket.emit(Constants.EVENTS.userAdded, user.publicData);
        socket.broadcast.emit(Constants.EVENTS.globalUserAdded, {userName: userName});
      }
      else {
        Util.sendError(socket, Constants.EVENTS.userError, 422, "This name (" + userName + ") already exits!");
      }
    }
    else {
      Util.sendShortError(socket, "User name is required!");
    }
  },
  logout: function(socket, enemySocket) {
    var user = UserHandler.getUserBySocketId(socket.id);
    var fields = GameHandler.getFields(socket.id);
    UserHandler.removeUserBySocketId(socket.id);
    GameHandler.removeGameByPlayerId(socket.id);

    if(user) {
      socket.broadcast.emit(Constants.EVENTS.globalUserLeft, {userName: user.name});
    }

    if(enemySocket) {
      var player2 = UserHandler.getUserBySocketId(enemySocket.id);
      UserHandler.resetUser(enemySocket.id);
      logger.info("User disconnected from party", enemySocket.id, player2);
      if(player2) {
        enemySocket.emit(Constants.EVENTS.gameEnd, {
          winner: player2.name,
          fields: fields,
          type: Constants.GAME_END_TYPES.userLeft
        });
      }
    }
  },
  isAuthenticated: function(socket) {
    var isAuthenticated = UserHandler.isAuthenticated(socket.id);
    if(!isAuthenticated) {
      Util.sendError(socket, Constants.EVENTS.userError, 401, "You are not logged in!");
      socket.disconnect();
    }
    else {
      logger.info("Authenticated", socket.id);
    }
    return isAuthenticated;
  }
};
