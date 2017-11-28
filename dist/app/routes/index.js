'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (app) {

  app.route('/').get(root.initialMsg);

  app.route('/blocks').get(block.getBlocks).post(block.addBlock);

  app.route('/peers').get(peer.listPeers).post(peer.addPeers);
};

var _root = require('./root');

var root = _interopRequireWildcard(_root);

var _block = require('./block');

var block = _interopRequireWildcard(_block);

var _peer = require('./peer');

var peer = _interopRequireWildcard(_peer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }