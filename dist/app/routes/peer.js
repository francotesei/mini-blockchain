'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addPeers = exports.listPeers = undefined;

var _P2P = require('../model/P2P');

var _P2P2 = _interopRequireDefault(_P2P);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var listPeers = function listPeers(req, res) {
  res.send(_P2P2.default.listPeers());
};

var addPeers = function addPeers(req, res) {
  res.send(_P2P2.default.connectToPeers({ peers: req.body.peers }));
};

exports.listPeers = listPeers;
exports.addPeers = addPeers;