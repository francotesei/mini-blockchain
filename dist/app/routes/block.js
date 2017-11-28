'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addBlock = exports.getBlocks = undefined;

var _Blockchain = require('../model/Blockchain');

var _Blockchain2 = _interopRequireDefault(_Blockchain);

var _P2P = require('../model/P2P');

var _P2P2 = _interopRequireDefault(_P2P);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getBlocks = function getBlocks(req, res) {
  res.send(JSON.stringify(_Blockchain2.default.chain));
};

var addBlock = function addBlock(req, res) {
  var block = JSON.stringify(_Blockchain2.default.addBlock({
    block: _Blockchain2.default.nextBlock({ data: req.body.data })
  }));
  _P2P2.default.broadcast({ message: _P2P2.default.getQueryForType({ type: _P2P2.default.messageType.QUERY_LATEST }) });
  res.send(block);
};

exports.getBlocks = getBlocks;
exports.addBlock = addBlock;