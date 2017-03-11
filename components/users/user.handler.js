var _ = require('lodash');
var User = require('./user');
var logger = require('../../log');
var Constants = require('../constants');

var users = [];

function getUserByName(name) {
  return _.find(users, function (user) {
    return user.getName() === name;
  });
}

function getUserBySocketId(socketId) {
  return _.find(users, function (user) {
    return user.getSocketId() === socketId;
  });
}

function initUserDataForMatch(user) {
  if(user) {
    return {
      enemy: user.getEnemy(),
      socketId: user.getSocketId(),
      logData: user.getDataForLog(),
      name: user.getName()
    }
  }
  logger.warn("initUserDataForMatch", "User not found!");
  return null;
}

module.exports = {
  addNewUser: function(socketId, name) {
    var loggedInUser = _.find(users, function (user) {
      return user.getName() === name;
    });

    if (loggedInUser) {
      return null;
    }

    var newUser = new User(socketId, name);
    users.push(newUser);
    return {
      publicData: newUser.getPublicData(),
      logData: newUser.getDataForLog()
    };
  },
  removeUserBySocketId: function (socketId) {
    return _.remove(users, function (user) {
      return user.getSocketId() === socketId;
    });
  },
  getNotPlayingUsers: function(socketId) {
    var tmp = [];

    _.forEach(users, function(user) {
      if(!user.getEnemy() && user.getSocketId() !== socketId) {
        tmp.push(user.getName());
      }
    });

    logger.info("getNotPlayingUsers", socketId, "list not playing users", tmp);
    return tmp;
  },
  isAuthenticated: function(socketId) {
    var loggedInUser = _.find(users, function (user) {
      return user.getSocketId() === socketId;
    });

    return (loggedInUser && loggedInUser.getSocketId());
  },
  getUserByName: function(name) {
    var user = getUserByName(name);
    return initUserDataForMatch(user);
  },
  setEnemyToUser: function(playerId, enemyId) {
    var user = getUserBySocketId(playerId);
    if(user) {
      user.setEnemy(enemyId);
    }
    else {
      logger.warn("setEnemyToUser", playerId, "User not found! Enemy id: " + enemyId);
    }
  },
  getUserBySocketId: function(socketId) {
    var user = getUserBySocketId(socketId);
    return initUserDataForMatch(user);
  },
  increaseMarkerCount: function(userName) {
    var user = getUserByName(userName);
    if(user) {
      return user.increaseMarkerCount();
    }
    logger.warn("increaseMarkerCount", "User not found!", userName);
  },
  decreaseMarkerCount: function(userName) {
    var user = getUserByName(userName);
    if(user) {
      return user.decreaseMarkerCount();
    }
    logger.warn("decreaseMarkerCount", "User not found!", userName);
  },
  getMarkerCount: function(userName) {
    var user = getUserByName(userName);
    if(user) {
      return user.getMarkerCount();
    }
    logger.warn("getMarkerCount", "User not found!", userName);
  },
  resetUser: function(socketId) {
    var user = getUserBySocketId(socketId);
    if(user) {
      user.resetMarkerCount();
      user.setEnemy(null);
      user.setScore(0);
      user.setBombWasTolerated(false);
    }
    logger.warn("resetUser", "User not found!", socketId);
  },
  addScore: function(userName, score) {
    var user = getUserByName(userName);
    if(user) {
      var tmp = score * Constants.SCORE_MULTIPLIER;
      user.setScore(tmp + user.getScore());
      return user.getScore();
    }
    logger.warn("addScore", "User not found!", userName, score);
  },
  getBombWasTolerated: function(socketId) {
    var user = getUserBySocketId(socketId);
    return (user) ? user.getBombWasTolerated() : true;
  },
  getPlayerScore: function(socketId) {
    var user = getUserBySocketId(socketId);
    return (user) ? user.getScore() : 0;
  },
  setBombWasTolerated: function(socketId) {
    var user = getUserBySocketId(socketId);
    if(user) {
      user.setBombWasTolerated(true);
    }
    else {
      logger.warn("setBombWasTolerated", "User not found!", socketId);
    }
  }
};