var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

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

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

io.on('connection', function(socket) {
  socket.on("authentication", function(data) {
    console.log("authentication", socket.id, data);
    authenticate.login(socket, data);
  });
  socket.on('disconnect', function(){
    console.log("disconnect", socket.id);
    var player2Id = userLogic.getUserEnemyId(socket.id);
    var player2Socket = Util.getUserSocket(socket, io, player2Id);
    authenticate.logout(socket.id, player2Socket);
  });
  socket.on('user.list', function() {
    console.log("get not playing users", socket.id);
    if(authenticate.isAuthenticated(socket)) {
      var result = userLogic.getNotPlayingUsers(socket.id);
      socket.emit("user.listed", result);
    }
  });
  socket.on('user.select', function(data) {
    console.log("select opponent", socket.id, data);
    if(authenticate.isAuthenticated(socket)) {
      var result = userLogic.matchUsers(socket, data, "challenge");

      console.log("selected opponent", result);
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
  socket.on('user.answerPlay', function(data) {
    console.log("answer to challenge", socket.id, data);
    if(authenticate.isAuthenticated(socket)) {
      var result = userLogic.matchUsers(socket, data, "answer");

      console.log("answered to challenge", result);
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
  socket.on('game.start', function() {
    console.log("game start", socket.id);
    if(authenticate.isAuthenticated(socket)) {
      var player2Id = userLogic.getUserEnemyId(socket.id);
      var player2Socket = Util.getUserSocket(socket, io, player2Id);
      if(player2Socket) {
        var result = gameLogic.initGame(socket, player2Socket);
        if(result && result.game && result.nextPlayerId) {
          var nextPlayerName = userLogic.getUserName(result.nextPlayerId);
          var game = result.game;

          socket.emit("game.started", {game: game, nextPlayerName: nextPlayerName});
          player2Socket.emit("game.started", {game: game, nextPlayerName: nextPlayerName});
        }
        else {
          Util.sendShortError(socket, "Can't create game!", result);
          Util.sendShortError(player2Socket, "Can't create game!", result);
        }
      }
    }
  });
  socket.on('game.mark', function(data) {
    console.log("mark as bomb", socket.id, data);
    if(authenticate.isAuthenticated(socket)) {
      var player1Name = userLogic.getUserName(socket.id);
      var player2Id = userLogic.getUserEnemyId(socket.id);
      var player2Socket = Util.getUserSocket(socket, io, player2Id);
      var maxFields = gameLogic.getMaxFields(socket.id);
      if (maxFields && !maxFields.error) {
        if(player2Socket) {
          if(data && data.mark && data.mark.x >= 0 && data.mark.y >= 0 && maxFields && data.mark.x < maxFields.x && data.mark.y < maxFields.y) {
            var result = gameLogic.markAsBomb(socket.id, data.mark, player1Name);
            if (result && !result.error) {
              socket.emit("game.marked", {marked: result});
              player2Socket.emit("game.marked", {marked: result});
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
        Util.manageError(socket, maxFields);
      }

    }
  });
  socket.on('game.shot', function(data) {
    console.log("check the field", socket.id, data);
    if(authenticate.isAuthenticated(socket)) {
      var player1Name = userLogic.getUserName(socket.id);
      var player2Id = userLogic.getUserEnemyId(socket.id);
      var player2Socket = Util.getUserSocket(socket, io, player2Id);
      var maxFields = gameLogic.getMaxFields(socket.id);
      if (maxFields && !maxFields.error) {
        if(player2Socket) {
          if(data && data.shot && data.shot.x >= 0 && data.shot.y >= 0 && maxFields && data.shot.x < maxFields.x && data.shot.y < maxFields.y) {
            var result = gameLogic.shotField(socket.id, data.shot, player1Name);
            if (result && !result.error) {
              var player2Name = userLogic.getUserName(player2Id);
              if(result === Constants.END_GAME) {
                userLogic.setEnemyToUser(socket.id, null);
                userLogic.setEnemyToUser(player2Id, null);

                socket.emit("game.end", {winner: player2Name});
                player2Socket.emit("game.end", {winner: player2Name});
              }
              else {
                socket.emit("game.shooted", {shooted: result, nextPlayerName: player2Name});
                player2Socket.emit("game.shooted", {shooted: result, nextPlayerName: player2Name});
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
  console.log(err);

  // render the error page
  res.status(err.status || 500);
  res.json({error: err.message});
});

module.exports = {app: app, server: server};
