var UserHandler = require('./user.handler.js');
var Constants = require('../constants.js');

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
            console.log("match user", "want play", data, type, targetUser.logData, sourceUser.logData);
            result.eventId = "user.wantPlay";
            result.data = {challengerName: sourceUser.name};
          }
          else if(answer && answer === "yes") {
            UserHandler.setEnemyToUser(targetUser.socketId, sourceUser.socketId);
            UserHandler.setEnemyToUser(sourceUser.socketId, targetUser.socketId);

            console.log("match user", "accepted play", data, type, targetUser.logData, sourceUser.logData);
            result.eventId = "user.acceptedPlay";
            result.data = {enemyName: sourceUser.name};
          }
          else {
            console.log("match user", "declined play", data, type, targetUser.logData, sourceUser.logData);
            result.eventId = "user.declinedPlay";
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
      for(var i = 0; i < shotData.length; i++) {
        score += shotData[i].value || 0;
      }
      return UserHandler.addScore(userName, score);
    }
  }
};
