var _ = require('lodash');
var User = require('./user');

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

    console.log("list not playing users", tmp);
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
  },
  getMarkerCount: function(userName) {
    var user = getUserByName(userName);
    if(user) {
      return user.getMarkerCount();
    }
  },
  resetUser: function(socketId) {
    var user = getUserBySocketId(socketId);
    if(user) {
      user.resetMarkerCount();
      user.setEnemy(null);
      user.setScore(0);
    }
  },
  addScore: function(userName, score) {
    var user = getUserByName(userName);
    if(user) {
      var tmp = (score + 1) * 1000;
      user.setScore(tmp + user.getScore());
      return user.getScore();
    }
  }
};