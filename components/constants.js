const BOMB = -1;
const TOLERATED_BOMB = -2;
const WAS_TOLERATED_BOMB = "WAS_TOLERATED_BOMB";

const GAME_NOT_FOUND = "GAME_NOT_FOUND";
const ALREADY_MARKED = "ALREADY_MARKED";
const ALREADY_SHOOTED = "ALREADY_SHOOTED";
const ALREADY_PLAYING = "ALREADY_PLAYING";
const NOT_YOUR_TURN = "NOT_YOUR_TURN";
const USER_NOT_FOUND = "USER_NOT_FOUND";
const NAME_REQUIRED = "NAME_REQUIRED";
const FIELD_ERROR = "FIELD_ERROR";

const END_GAME = "END_GAME";

const SCORE_MULTIPLIER = 1000;
const FLAG_MULTIPLIER = 5000;

const EVENTS = {
  authentication: "authentication",
  connection: "connection",
  disconnect: "disconnect",
  gameEnd: "game.end",
  gameMark: "game.mark",
  gameMarked: "game.marked",
  gameStart: "game.start",
  gameStarted: "game.started",
  gameShooted: "game.shooted",
  gameShot: "game.shot",
  gameWarn: "game.warn",
  userAcceptedPlay: "user.acceptedPlay",
  userAdded: "user.added",
  userAnswerPlay: "user.answerPlay",
  userDeclinedPlay: "user.declinedPlay",
  userError: "user.error",
  userLeft: "user.left",
  userList: "user.list",
  userListed: "user.listed",
  userSelect: "user.select",
  userWantPlay: "user.wantPlay",
  globalUserAdded: "global.user.added",
  globalUserLeft: "global.user.left"
};

const GAME_END_TYPES = {
  bombFound: "bombFound",
  userLeft: "userLeft",
  allFieldChecked: "allFieldChecked"
};

module.exports = {
  BOMB: BOMB,
  TOLERATED_BOMB: TOLERATED_BOMB,
  GAME_NOT_FOUND: GAME_NOT_FOUND,
  WAS_TOLERATED_BOMB: WAS_TOLERATED_BOMB,
  ALREADY_MARKED: ALREADY_MARKED,
  ALREADY_SHOOTED: ALREADY_SHOOTED,
  ALREADY_PLAYING: ALREADY_PLAYING,
  NOT_YOUR_TURN: NOT_YOUR_TURN,
  USER_NOT_FOUND: USER_NOT_FOUND,
  NAME_REQUIRED: NAME_REQUIRED,
  FIELD_ERROR: FIELD_ERROR,
  END_GAME: END_GAME,
  EVENTS: EVENTS,
  GAME_END_TYPES: GAME_END_TYPES,
  SCORE_MULTIPLIER: SCORE_MULTIPLIER,
  FLAG_MULTIPLIER: FLAG_MULTIPLIER
};