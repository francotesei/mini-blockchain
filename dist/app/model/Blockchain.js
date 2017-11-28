"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _cryptoJs = require("crypto-js");

var CryptoJS = _interopRequireWildcard(_cryptoJs);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var calculateHash = function calculateHash(params) {
  var index = params.index,
      previoushash = params.previoushash,
      timestamp = params.timestamp,
      data = params.data;

  return CryptoJS.SHA256(index + previousHash + timestamp + data).toString();
};
var calculateHashForBlock = function calculateHashForBlock(params) {
  var newBlock = params.newBlock;

  return calculateHash({
    index: newBlock.index,
    previousHash: newBlock.previousHash,
    timestamp: newBlock.timestamp,
    data: newBlock.data });
};

var Block = function Block(data, latestBlock) {
  _classCallCheck(this, Block);

  this.index = latestBlock.index + 1;
  this.previousHash = latestBlock.hash;
  this.timestamp = new Date().getTime();
  this.data = data;
  this.hash = calculateHash({
    index: this.index,
    previousHash: this.previousHash,
    timestamp: this.timestamp,
    data: data });
};

var Blockchain = function () {
  function Blockchain(genesisBlock) {
    _classCallCheck(this, Blockchain);

    this.chain = [];
    this.chain.push(genesisBlock);
  }

  _createClass(Blockchain, [{
    key: "nextBlock",
    value: function nextBlock(params) {
      var data = params.data;

      return new Block(data, this.getLatestBlock());
    }
  }, {
    key: "getLatestBlock",
    value: function getLatestBlock() {
      return this.chain[this.chain.length - 1];
    }
  }, {
    key: "addBlock",
    value: function addBlock(params) {
      var block = params.block;

      if (this.isValidBlock({ newBlock: block })) {
        this.chain.push(block);
        console.log("Added block", block);
        return block;
      }
    }
  }, {
    key: "isValidBlock",
    value: function isValidBlock(params) {
      var newBlock = params.newBlock,
          preBlock = params.preBlock;


      console.log("Validating blocks");
      var previousBlock = preBlock == undefined ? this.getLatestBlock() : preBlock;

      if (previousBlock.index + 1 !== newBlock.index) {
        console.log('invalid index');
        return false;
      } else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('invalid previoushash');
        return false;
      } else if (calculateHashForBlock({ newBlock: newBlock }) !== newBlock.hash) {
        console.log(_typeof(newBlock.hash) + ' ' + _typeof(calculateHashForBlock({ newBlock: newBlock })));
        console.log('invalid hash: ' + calculateHashForBlock({ newBlock: newBlock }) + ' ' + newBlock.hash);
        return false;
      }
      return true;
    }
  }, {
    key: "replaceChain",
    value: function replaceChain(params) {
      var newBlocks = params.newBlocks;

      if (this.isValidChain({ newBlocks: newBlocks }) && newBlocks.length > blockchain.length) {
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
        blockchain = newBlocks;
        return true;
      } else {
        console.log('Received blockchain invalid');
        return false;
      }
    }
  }, {
    key: "isValidChain",
    value: function isValidChain(params) {
      var blockchainToValidate = params.blockchainToValidate;


      if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(this.chain[0])) {
        return false;
      }
      var tempBlocks = [blockchainToValidate[0]];
      for (var i = 1; i < blockchainToValidate.length; i++) {
        if (this.isValidBlock({ newBlock: blockchainToValidate[i], preBlock: tempBlocks[i - 1] })) {
          tempBlocks.push(blockchainToValidate[i]);
        } else {
          return false;
        }
      }
      return true;
    }
  }]);

  return Blockchain;
}();

var index = 0;
var previousHash = 0;
var timestamp = new Date().getTime();
var data = "i am genesis block";
var hash = calculateHash(index, previousHash, timestamp, data);
var instance = new Blockchain({ index: index, previousHash: previousHash, timestamp: timestamp, data: data, hash: hash });

Object.freeze(instance);
exports.default = instance;