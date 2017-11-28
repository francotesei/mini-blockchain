'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _index = require('./routes/index');

var _index2 = _interopRequireDefault(_index);

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

var _P2P = require('./model/P2P');

var _P2P2 = _interopRequireDefault(_P2P);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var http_port = process.env.HTTP_PORT || 3001;
var p2p_port = process.env.P2P_PORT || 6001;
var initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];

var initHttpServer = function initHttpServer() {
  var app = (0, _express2.default)();
  app.use(_bodyParser2.default.json());
  app.use((0, _morgan2.default)('combined'));
  (0, _index2.default)(app);
  app.listen(http_port, function () {
    return console.log('Listening http on port: ' + http_port);
  });
};

var initP2PServer = function initP2PServer() {
  var server = new _ws2.default.Server({ port: p2p_port });
  server.on('connection', function (ws) {
    return _P2P2.default.initConnection({ ws: ws });
  });
  console.log('listening websocket p2p port on: ' + p2p_port);
};
_P2P2.default.connectToPeers({ peers: initialPeers });
initHttpServer();
initP2PServer();