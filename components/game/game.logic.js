var GameHandler = require('./game.handler.js');
var Constants = require('../constants.js');
var logger = require('../../log');

var config = {
  x: 16,
  y: 16,
  fields: [],
  mineCount: 51, // min 3!
  maxMarker: Math.ceil(51 / 2),
  bombTolerateScore: 5000
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
    if (config.fields[x - 1][y] === Constants.BOMB) {
      actualValue++;
    }
    if (config.fields[x - 1][y + 1] === Constants.BOMB) {
      actualValue++;
    }
  }
  if(x + 1 < config.x) {
    if (config.fields[x + 1][y + 1] === Constants.BOMB) {
      actualValue++;
    }
    if (config.fields[x + 1][y] === Constants.BOMB) {
      actualValue++;
    }
    if (config.fields[x + 1][y - 1] === Constants.BOMB) {
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

  logger.info("generateMines", "mine count: ", actualMine);
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
    this.removeGameByPlayerId(player1Socket.id);
    generateFields();
    var nextPlayerId = player1Socket.id;
    if(Math.random() >= 0.5) {
      nextPlayerId = player2Socket.id;
    }

    var game = GameHandler.addNewGame(player1Socket.id, player2Socket.id, config, nextPlayerId);
    logger.info("init game", game, "nextPlayerId: " + nextPlayerId);

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
  shotField: function(playerId, shot, playerName, wasBombTolerated, playerScore) {
    var isCurrentPlayer = GameHandler.isCurrentPlayer(playerId);
    if (isCurrentPlayer) {
      return GameHandler.addShootedField(playerId, shot, playerName, wasBombTolerated, playerScore);
    }
    return {
      error: Constants.NOT_YOUR_TURN
    };
  },
  isAllFieldShooted: function(playerId) {
    return GameHandler.isAllFieldShooted(playerId);
  },
  removeGameByPlayerId: function(playerId) {
    GameHandler.removeGameByPlayerId(playerId);
  },
  getScoreForFlags: function(playerId, playerName) {
    var markList = GameHandler.getMarkedFields(playerId);
    var fields = GameHandler.getFields(playerId);
    var score = 0;
    if(markList && Array.isArray(markList) && fields && Array.isArray(fields)) {
      markList = markList.filter(function(item) {
        return item.playerName === playerName;
      });

      for(var i = 0; i < markList.length; i++) {
        var field = fields[markList[i].x][markList[i].y];
        if(field === Constants.BOMB) {
          score += Constants.FLAG_MULTIPLIER;
        }
        else {
          score -= Constants.FLAG_MULTIPLIER * 2;
        }
      }
    }
    else {
      logger.warn("getScoreForFlags", "mark list or fields was falsy", markList, fields);
    }
    return score;
  }
};