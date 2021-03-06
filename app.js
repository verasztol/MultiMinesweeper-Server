var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('./log.js');

// routing import
var index = require('./routes/index');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var authenticate = require('./components/users/authenticate');
var userLogic = require('./components/users/user.logic.js');
var gameLogic = require('./components/game/game.logic.js');
var Util = require('./components/util.js');
var Constants = require('./components/constants.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

io.on(Constants.EVENTS.connection, function(socket) {
  socket.on(Constants.EVENTS.authentication, function(data) {
    logger.info("authentication", socket.id, data);
    authenticate.login(socket, data);
  });
  socket.on(Constants.EVENTS.disconnect, function(){
    logger.info("disconnect", socket.id);
    var player2Id = userLogic.getUserEnemyId(socket.id);
    var player2Socket = Util.getUserSocket(socket, io, player2Id);
    authenticate.logout(socket, player2Socket);
  });
  socket.on(Constants.EVENTS.userList, function() {
    logger.info("get not playing users", socket.id);
    if(authenticate.isAuthenticated(socket)) {
      var result = userLogic.getNotPlayingUsers(socket.id);
      socket.emit(Constants.EVENTS.userListed, result);
    }
  });
  socket.on(Constants.EVENTS.userSelect, function(data) {
    logger.info("select opponent", socket.id, data);
    if(authenticate.isAuthenticated(socket)) {
      var result = userLogic.matchUsers(socket, data, "challenge");

      logger.info("selected opponent", result);
      if (result && result.eventId && result.socketId && !result.error) {
        var targetUserSocket = Util.getUserSocket(socket, io, result.socketId);
        if (targetUserSocket) {
          targetUserSocket.emit(result.eventId, result.data);
        }
      }
      else {
        Util.manageError(socket, result);
      }
    }
  });
  socket.on(Constants.EVENTS.userAnswerPlay, function(data) {
    logger.info("answer to challenge", socket.id, data);
    if(authenticate.isAuthenticated(socket)) {
      var result = userLogic.matchUsers(socket, data, "answer");

      logger.info("answered to challenge", result);
      if (result && result.eventId && result.socketId && !result.error) {
        var targetUserSocket = Util.getUserSocket(socket, io, result.socketId);
        if (targetUserSocket) {
          targetUserSocket.emit(result.eventId, result.data);
        }
      }
      else {
        Util.manageError(socket, result);
      }
    }
  });
  socket.on(Constants.EVENTS.gameStart, function() {
    logger.info("game start", socket.id);
    if(authenticate.isAuthenticated(socket)) {
      var player2Id = userLogic.getUserEnemyId(socket.id);
      var player2Socket = Util.getUserSocket(socket, io, player2Id);
      if(player2Socket) {
        var result = gameLogic.initGame(socket, player2Socket);
        if(result && result.game && result.nextPlayerId) {
          var nextPlayerName = userLogic.getUserName(result.nextPlayerId);
          var game = result.game;

          socket.emit(Constants.EVENTS.gameStarted, {game: game, nextPlayerName: nextPlayerName});
          player2Socket.emit(Constants.EVENTS.gameStarted, {game: game, nextPlayerName: nextPlayerName});
        }
        else {
          Util.sendShortError(socket, "Can't create game!", result);
          Util.sendShortError(player2Socket, "Can't create game!", result);
        }
      }
    }
  });
  socket.on(Constants.EVENTS.gameMark, function(data) {
    logger.info("mark as bomb", socket.id, data);
    if(authenticate.isAuthenticated(socket)) {
      var player1Name = userLogic.getUserName(socket.id);
      var player2Id = userLogic.getUserEnemyId(socket.id);
      var player2Socket = Util.getUserSocket(socket, io, player2Id);
      var maxFields = gameLogic.getMaxFields(socket.id);
      var currentMarkedCount = userLogic.getMarkerCount(player1Name);
      if (maxFields && !maxFields.error) {
        if(maxFields.maxMarker > currentMarkedCount) {
          if (player2Socket) {
            if (data && data.mark && data.mark.x >= 0 && data.mark.y >= 0 && data.mark.x < maxFields.x && data.mark.y < maxFields.y) {
              var result = gameLogic.markAsBomb(socket.id, data.mark, player1Name);
              if (result && !result.error) {
                var markerCount = 0;
                if(result.type === "unmark") {
                  markerCount = userLogic.decreaseMarkerCount(player1Name);
                }
                else {
                  markerCount = userLogic.increaseMarkerCount(player1Name);
                }
                socket.emit(Constants.EVENTS.gameMarked, {marked: result, markerCount: markerCount});
                player2Socket.emit(Constants.EVENTS.gameMarked, {marked: result, markerCount: markerCount});
              }
              else {
                Util.manageError(socket, result);
              }
            }
            else {
              Util.sendShortError(socket, "No mark data!", [data, maxFields]);
            }
          }
        }
        else {
          Util.sendError(socket, Constants.EVENTS.gameWarn, 406, "No more flag!", [currentMarkedCount, maxFields.maxMarker]);
        }
      }
      else {
        Util.manageError(socket, maxFields);
      }

    }
  });
  socket.on(Constants.EVENTS.gameShot, function(data) {
    logger.info("check the field", socket.id, data);
    if(authenticate.isAuthenticated(socket)) {
      var player1Name = userLogic.getUserName(socket.id);
      var player2Id = userLogic.getUserEnemyId(socket.id);
      var wasBombTolerated = userLogic.getBombWasTolerated(socket.id);
      var player1Score = userLogic.getPlayerScore(socket.id);
      var player2Socket = Util.getUserSocket(socket, io, player2Id);
      var maxFields = gameLogic.getMaxFields(socket.id);

      if (maxFields && !maxFields.error) {
        if(player2Socket) {
          if(data && data.shot && data.shot.x >= 0 && data.shot.y >= 0 && maxFields && data.shot.x < maxFields.x && data.shot.y < maxFields.y) {
            var result = gameLogic.shotField(socket.id, data.shot, player1Name, wasBombTolerated, player1Score);
            if (result && !result.error) {
              var player2Name = userLogic.getUserName(player2Id);
              if(result.type === Constants.END_GAME) {
                userLogic.resetUser(socket.id);
                userLogic.resetUser(player2Id);

                socket.emit(Constants.EVENTS.gameEnd, {winner: player2Name, fields: result.fields, type: Constants.GAME_END_TYPES.bombFound});
                player2Socket.emit(Constants.EVENTS.gameEnd, {winner: player2Name, fields: result.fields, type: Constants.GAME_END_TYPES.bombFound});
              }
              else {
                if (result.type === Constants.WAS_TOLERATED_BOMB) {
                  userLogic.setBombWasTolerated(socket.id);
                  var score = userLogic.calculateScore(result.data);
                  socket.emit(Constants.EVENTS.gameShooted, {
                    shooted: result.data,
                    nextPlayerName: player2Name,
                    score: score
                  });
                  player2Socket.emit(Constants.EVENTS.gameShooted, {
                    shooted: result.data,
                    nextPlayerName: player2Name,
                    score: score
                  });
                  Util.sendError(socket, Constants.EVENTS.gameWarn, 405, "This is your first bomb and your score is under " + result.bombToleratedScore + ", so you get an extra life!", [result]);
                }
                else {
                  var score = userLogic.calculateScore(result);
                  socket.emit(Constants.EVENTS.gameShooted, {
                    shooted: result,
                    nextPlayerName: player2Name,
                    score: score
                  });
                  player2Socket.emit(Constants.EVENTS.gameShooted, {
                    shooted: result,
                    nextPlayerName: player2Name,
                    score: score
                  });
                }

                var isAllFieldShooted = gameLogic.isAllFieldShooted(socket.id);
                logger.info("isAllFieldShooted", isAllFieldShooted);

                if(isAllFieldShooted) {
                  var _player1Score = userLogic.getPlayerScore(socket.id);
                  var _player2Score = userLogic.getPlayerScore(player2Socket.id);

                  var player1ScorModifier = gameLogic.getScoreForFlags(socket.id, player1Name);
                  var player2ScorModifier = gameLogic.getScoreForFlags(player2Socket.id, player2Name);

                  _player1Score += player1ScorModifier;
                  _player2Score += player2ScorModifier;

                  var winner = "You have the same score, the game is a draw!";
                  if(_player1Score > _player2Score) {
                    winner = player1Name;
                  }
                  else if(_player2Score > _player1Score) {
                    winner = player2Name;
                  }

                  gameLogic.removeGameByPlayerId(socket.id);
                  userLogic.resetUser(socket.id);
                  userLogic.resetUser(player2Id);

                  socket.emit(Constants.EVENTS.gameEnd, {winner: winner, type: Constants.GAME_END_TYPES.allFieldChecked, scores: {myScore: _player1Score, opponentScore: _player2Score}});
                  player2Socket.emit(Constants.EVENTS.gameEnd, {winner: winner, type: Constants.GAME_END_TYPES.allFieldChecked, scores: {myScore: _player2Score, opponentScore: _player1Score}});
                }
              }
            }
            else {
              Util.manageError(socket, result);
            }
          }
          else {
            Util.sendShortError(socket, "No field data!", [data, maxFields]);
          }
        }
      }
      else {
        Util.manageError(socket, maxFields);
      }
    }
  });
});

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Page not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  logger.error(err);

  // render the error page
  res.status(err.status || 500);
  res.json({error: err.message});
});

var port = process.env.PORT || '3000';
app.set('port', port);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  logger.info('Listening on ' + bind);
  console.log('Listening on ' + bind);
}

module.exports = {app: app, server: server};
