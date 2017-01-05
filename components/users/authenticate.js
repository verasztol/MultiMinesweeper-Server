var UserHandler = require('./user.handler.js');
var GameHandler = require('../game/game.handler.js');
var Util = require('../util.js');

module.exports = {
  login: function(socket, data) {
    var userName = data.userName;

    if (userName) {
      var user = UserHandler.addNewUser(socket.id, userName);

      if (user && user.publicData && user.logData) {
        console.log("user.added", user.logData);
        socket.emit("user.added", user.publicData);
      }
      else {
        Util.sendError(socket, "user.error", 422, "This name (" + userName + ") already exits!");
      }
    }
    else {
      Util.sendShortError(socket, "User name is required!");
    }
  },
  logout: function(socketId, enemySocket) {
    UserHandler.removeUserBySocketId(socketId);
    GameHandler.removeGameByPlayerId(socketId);

    if(enemySocket) {
      UserHandler.setEnemyToUser(enemySocket.id, null);
      console.log("User disconnected from party");
      enemySocket.emit("user.left");
    }
  },
  isAuthenticated: function(socket) {
    var isAuthenticated = UserHandler.isAuthenticated(socket.id);
    if(!isAuthenticated) {
      Util.sendError(socket, "user.error", 401, "You are not logged in!");
      socket.disconnect();
    }
    else {
      console.log("Authenticated", socket.id);
    }
    return isAuthenticated;
  }
};
