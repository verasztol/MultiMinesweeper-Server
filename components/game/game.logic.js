var GameHandler = require('./game.handler.js');
var Constants = require('../constants.js');

var config = {
  x: 16,
  y: 16,
  fields: [],
  mineCount: 51,
  maxMarker: Math.ceil(51 / 2)
};

function setField(x, y) {
  var actualValue = config.fields[x][y];
  if(config.fields[x][y] === Constants.BOMB) {
    return Constants.BOMB;
  }
  if(config.fields[x][y - 1] === Constants.BOMB) {
    actualValue++;
  }
  if(config.fields[x][y + 1] === Constants.BOMB) {
    actualValue++;
  }
  if(x - 1 >= 0) {
    if (config.fields[x - 1][y - 1] === Constants.BOMB) {
      actualValue++;
    }
    else if (config.fields[x - 1][y] === Constants.BOMB) {
      actualValue++;
    }
    else if (config.fields[x - 1][y + 1] === Constants.BOMB) {
      actualValue++;
    }
  }
  if(x + 1 < config.x) {
    if (config.fields[x + 1][y + 1] === Constants.BOMB) {
      actualValue++;
    }
    else if (config.fields[x + 1][y] === Constants.BOMB) {
      actualValue++;
    }
    else if (config.fields[x + 1][y - 1] === Constants.BOMB) {
      actualValue++;
    }
  }
  return actualValue;
}

function generateMines() {
  var actualMine = 0;

  while(actualMine < config.mineCount) {
    var x = Math.floor(Math.random() * (config.x - 1));
    var y = Math.floor(Math.random() * (config.y - 1));

    if(config.fields[x][y] === 0) {
      config.fields[x][y] = Constants.BOMB;
      actualMine++;
    }
  }
}

function generateFields() {
  for(var i = 0; i < config.x; i++) {
    config.fields[i] = [];
    for(var j = 0; j < config.y; j++) {
      config.fields[i][j] = 0;
    }
  }

  generateMines();

  for(i = 0; i < config.x; i++) {
    for(j = 0; j < config.y; j++) {
      config.fields[i][j] = setField(i, j);
    }
  }
}

module.exports = {
  initGame: function(player1Socket, player2Socket) {
    generateFields();
    var nextPlayerId = player1Socket.id;
    if(Math.random() >= 0.5) {
      nextPlayerId = player2Socket.id;
    }

    var game = GameHandler.addNewGame(player1Socket.id, player2Socket.id, config, nextPlayerId);
    console.log("init game", game, "nextPlayerId: " + nextPlayerId);

    return {
      nextPlayerId: nextPlayerId,
      game: game
    };
  },
  getMaxFields: function(playerId) {
    return GameHandler.getMaxFields(playerId);
  },
  markAsBomb: function(playerId, mark, playerName) {
    var isCurrentPlayer = GameHandler.isCurrentPlayer(playerId);
    if (isCurrentPlayer) {
      return GameHandler.addMarkedField(playerId, mark, playerName);
    }
    return {
      error: Constants.NOT_YOUR_TURN
    };
  },
  shotField: function(playerId, shot, playerName) {
    var isCurrentPlayer = GameHandler.isCurrentPlayer(playerId);
    if (isCurrentPlayer) {
      return GameHandler.addShootedField(playerId, shot, playerName);
    }
    return {
      error: Constants.NOT_YOUR_TURN
    };
  }
};