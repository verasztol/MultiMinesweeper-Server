var logger = require('../../log');

var User = function User(_socketId, _name) {
  var name = _name;
  var socketId = _socketId;
  var enemySocketId = null;
  var markerCount = 0;
  var score = 0;
  var bombWasTolerated = false;

  this.getName = function() {
    return name;
  };

  this.getSocketId = function() {
    return socketId;
  };

  this.getPublicData = function() {
    return {
      name: name
    }
  };

  this.getDataForLog = function() {
    return {
      socketId: socketId,
      name: name,
      enemySocketId: enemySocketId
    }
  };

  this.getEnemy = function() {
    return enemySocketId;
  };

  this.setEnemy = function(_enemyId) {
    enemySocketId = _enemyId;
  };

  this.increaseMarkerCount = function() {
    return ++markerCount;
  };

  this.getMarkerCount = function() {
    return markerCount || 0;
  };

  this.resetMarkerCount = function() {
    markerCount = 0;
  };

  this.getScore = function() {
    return score || 0;
  };

  this.setScore = function(s) {
    score = s;
  };

  this.setBombWasTolerated = function(t) {
    bombWasTolerated = t;
  };

  this.getBombWasTolerated = function() {
    return bombWasTolerated;
  };
};

module.exports = User;