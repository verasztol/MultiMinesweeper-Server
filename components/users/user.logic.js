var UserHandler = require('./user.handler.js');
var Constants = require('../constants.js');
var logger = require('../../log');

module.exports = {
  getNotPlayingUsers: function(playerId) {
    return UserHandler.getNotPlayingUsers(playerId);
  },
  matchUsers: function(socket, data, type) {
    var userName = data.userName;
    var answer = data.answer;

    if(userName) {
      var targetUser = UserHandler.getUserByName(userName);
      var sourceUser = UserHandler.getUserBySocketId(socket.id);

      if(targetUser && targetUser.socketId && sourceUser) {
        if(!targetUser.enemy && !sourceUser.enemy) {
          var result = {
            socketId: targetUser.socketId
          };
          if(type === "challenge") {
            logger.info("match user", "want play", data, type, targetUser.logData, sourceUser.logData);
            result.eventId = Constants.EVENTS.userWantPlay;
            result.data = {challengerName: sourceUser.name};
          }
          else if(answer && answer === "yes") {
            UserHandler.setEnemyToUser(targetUser.socketId, sourceUser.socketId);
            UserHandler.setEnemyToUser(sourceUser.socketId, targetUser.socketId);

            logger.info("match user", "accepted play", data, type, targetUser.logData, sourceUser.logData);
            result.eventId = Constants.EVENTS.userAcceptedPlay;
            result.data = {enemyName: sourceUser.name};
          }
          else {
            logger.info("match user", "declined play", data, type, targetUser.logData, sourceUser.logData);
            result.eventId = Constants.EVENTS.userDeclinedPlay;
            result.data = {enemyName: sourceUser.name};
          }
          return result;
        }
        else {
          var name = targetUser.enemy ? targetUser.name : sourceUser.name;
          return {
            error: Constants.ALREADY_PLAYING,
            data: [name, data, type, targetUser.logData, sourceUser.logData]
          };
        }
      }
      return {
        error: Constants.USER_NOT_FOUND,
        data: [data, type]
      };
    }
    return {
      error: Constants.NAME_REQUIRED,
      data: [data, type]
    };
  },
  getUserEnemyId: function(socketId) {
    var user = UserHandler.getUserBySocketId(socketId);
    if(user) {
      return user?user.enemy:null;
    }
    logger.warn("getUserEnemyId", "User not found!", socketId);
    return null;
  },
  getUserName: function(socketId) {
    var user = UserHandler.getUserBySocketId(socketId);
    return user?user.name:null;
  },
  setEnemyToUser: function(socketId, enemyId) {
    UserHandler.setEnemyToUser(socketId, enemyId);
  },
  increaseMarkerCount: function(userName) {
    return UserHandler.increaseMarkerCount(userName);
  },
  decreaseMarkerCount: function(userName) {
    return UserHandler.decreaseMarkerCount(userName);
  },
  getMarkerCount: function(userName) {
    return UserHandler.getMarkerCount(userName);
  },
  resetUser: function(socketId) {
    UserHandler.resetUser(socketId);
  },
  calculateScore: function(shotData) {
    if(shotData && Array.isArray(shotData) && shotData[0]) {
      var userName = shotData[0].playerName;
      var score = 0;
      logger.info("calculateScore", userName, "shotData", shotData);
      for(var i = 0; i < shotData.length; i++) {
        score += (shotData[i].value + 1) || 1;
      }
      return UserHandler.addScore(userName, score);
    }
    logger.warn("calculateScore", "ShotData not found!", shotData);
  },
  getBombWasTolerated: function(socketId) {
    return UserHandler.getBombWasTolerated(socketId);
  },
  getPlayerScore: function(socketId) {
    return UserHandler.getPlayerScore(socketId);
  },
  setBombWasTolerated: function(socketId) {
    return UserHandler.setBombWasTolerated(socketId);
  }
};
