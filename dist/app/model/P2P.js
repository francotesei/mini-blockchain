'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Blockchain = require('./Blockchain');

var _Blockchain2 = _interopRequireDefault(_Blockchain);

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MessageType = {
  QUERY_LATEST: 0,
  QUERY_ALL: 1,
  RESPONSE_BLOCKCHAIN: 2,
  RESPONSE_BLOCKCHAIN_LAST_BLOCK: 3,
  RESPONSE_BLOCKCHAIN_CHAIN: 4
};

var P2P = function () {
  function P2P() {
    _classCallCheck(this, P2P);

    this.sockets = [];
    this.messageType = MessageType;
  }

  _createClass(P2P, [{
    key: 'listPeers',
    value: function listPeers() {
      return this.sockets.map(function (s) {
        return s._socket.remoteAddress + ':' + s._socket.remotePort;
      });
    }
  }, {
    key: 'connectToPeers',
    value: function connectToPeers(params) {
      var peers = params.peers;

      var self = this;
      peers.forEach(function (peer) {
        var ws = new _ws2.default(peer);
        ws.on('open', function () {
          self.initConnection({ ws: ws });
        });
        ws.on('error', function () {
          console.log('connection failed');
        });
      });
      return peers;
    }
  }, {
    key: 'initConnection',
    value: function initConnection(params) {
      var ws = params.ws;

      this.sockets.push(ws);
      this.initMessageHandler({ ws: ws });
      this.initErrorHandler({ ws: ws });
      this.write({ ws: ws, message: { 'type': MessageType.QUERY_LATEST } });
    }
  }, {
    key: 'initMessageHandler',
    value: function initMessageHandler(params) {
      var _this = this;

      var ws = params.ws;


      ws.on('message', function (data) {
        console.log("dataCarloss", data);
        var message = JSON.parse(data);
        console.log('Received message' + JSON.stringify(message));
        _this.switchMsgResponse({ ws: ws, message: message });
      });
    }
  }, {
    key: 'switchMsgResponse',
    value: function switchMsgResponse(params) {
      var message = params.message,
          ws = params.ws;


      switch (message.type) {
        case MessageType.QUERY_LATEST:
          this.write({ ws: ws, message: this.getQueryForType({ type: message.type }) });
          break;
        case MessageType.QUERY_ALL:
          this.write({ ws: ws, message: this.getQueryForType({ type: message.type }) });
          break;
        case MessageType.RESPONSE_BLOCKCHAIN:
          this.handleBlockchainResponse({ message: message });
          break;
      }
    }
  }, {
    key: 'getQueryForType',
    value: function getQueryForType(params) {
      var type = params.type;

      switch (type) {
        case MessageType.QUERY_LATEST:
          return {
            'type': MessageType.RESPONSE_BLOCKCHAIN,
            'data': JSON.stringify([_Blockchain2.default.getLatestBlock()])
          };
        case MessageType.QUERY_ALL:
          return {
            'type': MessageType.RESPONSE_BLOCKCHAIN,
            'data': JSON.stringify(_Blockchain2.default.chain)
          };
        default:
          return;

      }
    }
  }, {
    key: 'handleBlockchainResponse',
    value: function handleBlockchainResponse(params) {
      var message = params.message;

      var receivedBlocks = JSON.parse(message.data).sort(function (b1, b2) {
        return b1.index - b2.index;
      });
      var latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
      var latestBlockHeld = _Blockchain2.default.getLatestBlock();
      if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log('blockchain possibly behind. We got: ' + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
          console.log("We can append the received block to our chain");
          _Blockchain2.default.chain.push(latestBlockReceived);
          this.broadcast({ message: this.getQueryForType({ type: MessageType.QUERY_LATEST }) });
        } else if (receivedBlocks.length === 1) {
          console.log("We have to query the chain from our peer");
          this.broadcast({ message: this.getQueryForType({ type: MessageType.QUERY_ALL }) });
        } else {
          console.log("Received blockchain is longer than current blockchain");
          if (_Blockchain2.default.replaceChain(receivedBlocks)) this.broadcast({ message: this.getQueryForType({ type: MessageType.QUERY_LATEST }) });
        }
      } else {
        console.log('received blockchain is not longer than received blockchain. Do nothing');
      }
    }
  }, {
    key: 'initErrorHandler',
    value: function initErrorHandler(params) {
      var _this2 = this;

      var ws = params.ws;

      ws.on('close', function () {
        return _this2.closeConnection({ ws: ws });
      });
      ws.on('error', function () {
        return _this2.closeConnection({ ws: ws });
      });
    }
  }, {
    key: 'closeConnection',
    value: function closeConnection(params) {
      var ws = params.ws;

      console.log('connection failed to peer: ' + ws.url);
      this.sockets.splice(this.sockets.indexOf(ws), 1);
    }
  }, {
    key: 'write',
    value: function write(params) {
      var ws = params.ws,
          message = params.message;

      console.log("Sending", JSON.stringify(message));
      return ws.send(JSON.stringify(message));
    }
  }, {
    key: 'broadcast',
    value: function broadcast(params) {
      var _this3 = this;

      var message = params.message;

      return this.sockets.forEach(function (socket) {
        return _this3.write({ ws: socket, message: message });
      });
    }
  }]);

  return P2P;
}();

var instance = new P2P();
Object.freeze(instance);
exports.default = instance;