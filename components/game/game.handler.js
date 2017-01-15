var _ = require('lodash');
var Game = require('./game');
var Constants = require('../constants');

var games = [];


function getGameById(gameId) {
  return _.find(games, function (game) {
    return game.getGameId() === gameId;
  });
}

function getGameByPlayerId(playerId) {
  return _.find(games, function (game) {
    return (game.getPlayer1Id() === playerId || game.getPlayer2Id() === playerId);
  });
}

function isMarkedField(fields, target) {
  for(var i = 0; i < fields.length; i++) {
    var field = fields[i];
    if(field.x === target.x && field.y === target.y) {
      return true;
    }
  }
  return false;
}

function checkShootedField(alreadyShootedFields, allFields, shot) {
  if(allFields && shot && allFields[shot.x] && allFields[shot.x][shot.y] >= Constants.BOMB) {

    var isShooted = isShootedField(alreadyShootedFields, shot);
    if(isShooted) {
      return {
        error: Constants.ALREADY_SHOOTED,
        data: shot
      };
    }

    var shootedFields = [];
    if(allFields[shot.x][shot.y] === Constants.BOMB) {
      return Constants.END_GAME;
    }
    // TODO if 0 then check neighbor
    // else if(allFields[shot.x][shot.y] === 0){
    //   // shootedFields = [];
    // }
    else {
      shot.value = allFields[shot.x][shot.y];
      shootedFields.push(shot);
    }
    return shootedFields;
  }
  return {
    error: Constants.FIELD_ERROR,
    data: [alreadyShootedFields, allFields, shot]
  }
}

function isShootedField(fields, target) {
  for(var i = 0; i < fields.length; i++) {
    var row = fields[i];
    for(var j = 0; j < row.length; j++) {
      var field = row[j];
      if (field.x === target.x && field.y === target.y) {
        return true;
      }
    }
  }
  return false;
}

module.exports = {
  addNewGame: function(player1Id, player2Id, config, nextPlayerId) {
    var newGame = new Game(player1Id, player2Id, config, nextPlayerId);
    console.log("generated game", newGame.getDataForLog());
    games.push(newGame);
    return newGame.getPublicData();
  },
  removeGameById: function (gameId) {
    return _.remove(games, function (game) {
      return game.getGameId() === gameId;
    });
  },
  removeGameByPlayerId: function (playerId) {
    return _.remove(games, function (game) {
      return (game.getPlayer1Id() === playerId || game.getPlayer2Id() === playerId);
    });
  },
  getMaxFields: function(playerId) {
    var game = getGameByPlayerId(playerId);
    if(game && game.getGameId() && game.getMaxFields()) {
      var tmp = game.getMaxFields();
      console.log("Max values.", tmp);
      return tmp;
    }
    return {
      error: Constants.GAME_NOT_FOUND,
      data: playerId
    };
  },
  addMarkedField: function(playerId, mark, playerName) {
    var game = getGameByPlayerId(playerId);
    if(game && game.getGameId()) {
      var fields = game.getMarkedFields();
      var alreadyShootedFields = game.getShootedFields();
      var isMarked = isMarkedField(fields, mark);
      var isShooted = isShootedField(alreadyShootedFields, mark);
      if(isMarked || isShooted) {
        return {
          error: Constants.ALREADY_MARKED,
          data: mark
        };
      }
      mark.playerName = playerName;
      fields.push(mark);
      console.log("This field is now marked!", game.getMarkedFields());
      return mark;
    }
    return {
      error: Constants.GAME_NOT_FOUND,
      data: [playerId, playerName]
    };
  },
  addShootedField: function(playerId, shot, playerName) {
    var game = getGameByPlayerId(playerId);
    if(game && game.getGameId() && game.getFields()) {
      var alreadyShootedFields = game.getShootedFields();

      shot.playerName = playerName;

      var shootedFields = checkShootedField(alreadyShootedFields, game.getFields(), shot);
      if(shootedFields.error) {
        return shootedFields;
      }

      if(shootedFields === Constants.END_GAME) {
        this.removeGameByPlayerId(playerId);
        return Constants.END_GAME;
      }

      alreadyShootedFields.push(shootedFields);
      console.log("These fields are now shooted!", game.getShootedFields());

      game.switchNextPlayer();
      console.log("Next player turn!", game.getCurrentPlayer());

      return shootedFields;
    }
    return {
      error: Constants.GAME_NOT_FOUND,
      data: [playerId, playerName]
    };
  },
  isCurrentPlayer: function(playerId) {
    var result = false;
    var game = getGameByPlayerId(playerId);
    if(game && game.getGameId()) {
      result = game.getCurrentPlayer() === playerId;
    }
    console.log("is current player", playerId, result);
    return result;
  }
};