var User = function User(_socketId, _name) {
  var name = _name;
  var socketId = _socketId;
  var enemySocketId = null;

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
};

module.exports = User;