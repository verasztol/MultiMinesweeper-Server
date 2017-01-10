var _ = require('lodash');

var Game = function Game(_player1Id, _player2Id, _config, _nextPlayerId) {
  var gameId = _player1Id + _player2Id + Date.now();
  var player1Id = _player1Id;
  var player2Id = _player2Id;
  var nextPlayerId = _nextPlayerId;
  var config = _config;
  var markedFields = [];
  var shootedFields = [];

  this.getGameId = function() {
    return gameId;
  };

  this.getPlayer1Id = function() {
    return player1Id;
  };

  this.getPlayer2Id = function() {
    return player2Id;
  };

  this.getConfig = function() {
    return config;
  };

  this.getFields = function() {
    if(config) {
      return config.fields;
    }
    return null;
  };

  this.getCurrentPlayer = function() {
    return nextPlayerId;
  };

  this.switchNextPlayer = function() {
    return nextPlayerId = ((nextPlayerId === player1Id) ? player2Id : player1Id);
  };

  this.getPublicData = function() {
    return {
      width: config.x,
      height: config.y,
      mineCount: config.mineCount,
      maxMarker: config.maxMarker
    }
  };

  this.getMaxFields = function() {
    if(config) {
      return {
        x: config.x,
        y: config.y
      }
    }
    return null;
  };

  this.getMarkedFields = function() {
    return markedFields || [];
  };

  this.getShootedFields = function() {
    return shootedFields || [];
  };

  this.getDataForLog = function() {
    var tmp = "";
    _.forEach(config.fields, function(row) {
      tmp += "[";
      _.forEach(row, function(field) {
        if(field >= 0) {
          tmp += " ";
        }
        tmp += field + ", ";
      });
      tmp += "], ";
      console.log(tmp);
      tmp = "";
    });

    return {
      gameId: gameId,
      player1Id: player1Id,
      player2Id: player2Id,
      width: config.x,
      height: config.y,
      mineCount: config.mineCount,
      fields: tmp,
      nextPlayerId: nextPlayerId,
      markedFields: markedFields,
      maxMarker: config.maxMarker,
      shootedFields: shootedFields
    }
  };
};

module.exports = Game;