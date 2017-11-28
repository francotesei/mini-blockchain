import * as CryptoJS from 'crypto-js'

var calculateHash = (params) => {
  let {index , previoushash ,timestamp,data} = params;
  return CryptoJS.SHA256(index + previousHash + timestamp + data).toString();
};
var calculateHashForBlock = (params) => {
  let {newBlock} = params;
  return calculateHash({
    index:newBlock.index,
    previousHash:newBlock.previousHash,
    timestamp:newBlock.timestamp,
    data:newBlock.data});
}

class Block {
  constructor(data, latestBlock) {

    this.index = latestBlock.index + 1;
    this.previousHash = latestBlock.hash;
    this.timestamp = new Date().getTime();
    this.data = data;
    this.hash = calculateHash({
      index:this.index,
      previousHash:this.previousHash,
      timestamp:this.timestamp,
      data:data});
  }
}

class Blockchain {

  constructor(genesisBlock) {
    this.chain = [];
    this.chain.push(genesisBlock);
  }

  nextBlock(params) {
    let {data} = params;
    return new Block(data, this.getLatestBlock());
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(params) {

    let {block} = params
    if (this.isValidBlock({newBlock:block})) {
      this.chain.push(block);
      console.log("Added block",block);
      return block;
    }
  }

  isValidBlock(params) {
    let {newBlock,preBlock} = params;

    console.log("Validating blocks");
    let previousBlock = (preBlock == undefined)
      ? this.getLatestBlock()
      : preBlock;

    if (previousBlock.index + 1 !== newBlock.index) {
      console.log('invalid index');
      return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
      console.log('invalid previoushash');
      return false;
    } else if (calculateHashForBlock({newBlock:newBlock}) !== newBlock.hash) {
      console.log(typeof(newBlock.hash) + ' ' + typeof calculateHashForBlock({newBlock:newBlock}));
      console.log('invalid hash: ' + calculateHashForBlock({newBlock:newBlock}) + ' ' + newBlock.hash);
      return false;
    }
    return true;
  }
  replaceChain(params) {
    let {newBlocks} = params;
    if (this.isValidChain({newBlocks:newBlocks}) && newBlocks.length > blockchain.length) {
      console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
      blockchain = newBlocks;
      return true;
    } else {
      console.log('Received blockchain invalid');
      return false;
    }
  };

  isValidChain(params) {
    let {blockchainToValidate} = params;

    if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(this.chain[0])) {
      return false;
    }
    var tempBlocks = [blockchainToValidate[0]];
    for (var i = 1; i < blockchainToValidate.length; i++) {
      if (this.isValidBlock({newBlock:blockchainToValidate[i], preBlock:tempBlocks[i - 1]})) {
        tempBlocks.push(blockchainToValidate[i]);
      } else {
        return false;
      }
    }
    return true;
  };

}
let index = 0;
let previousHash = 0;
let timestamp = new Date().getTime();
let data = "i am genesis block";
let hash = calculateHash(index, previousHash, timestamp, data)
var instance = new Blockchain({index: index, previousHash: previousHash, timestamp: timestamp, data: data, hash: hash});

Object.freeze(instance);
export default instance;
