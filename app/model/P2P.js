import Blockchain from './Blockchain';
import {default as WebSocket} from 'ws';

const MessageType = {
  QUERY_LATEST: 0,
  QUERY_ALL: 1,
  RESPONSE_BLOCKCHAIN: 2,
  RESPONSE_BLOCKCHAIN_LAST_BLOCK: 3,
  RESPONSE_BLOCKCHAIN_CHAIN: 4
};

class P2P {
  constructor() {
    this.sockets = [];
    this.messageType = MessageType;
  }

  listPeers() {
    return this.sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort);
  }

  connectToPeers(params) {
    let {peers} = params;
    var self = this;
    peers.forEach((peer) => {
      var ws = new WebSocket(peer);
      ws.on('open', () => {self.initConnection({ws:ws})});
      ws.on('error', () => {
        console.log('connection failed')
      });
    });
    return peers;
  }

  initConnection(params) {
    let {ws} = params;
    this.sockets.push(ws);
    this.initMessageHandler({ws:ws});
    this.initErrorHandler({ws:ws});
    this.write({ws:ws, message:{'type': MessageType.QUERY_LATEST}});
  };

  initMessageHandler(params) {
    let {ws} = params;

    ws.on('message', (data) => {
      var message = JSON.parse(data);
      console.log('Received message' + JSON.stringify(message));
      this.switchMsgResponse({ws:ws,message:message});
    });
  };

  switchMsgResponse(params) {
    let {message,ws} = params;

    switch (message.type) {
      case MessageType.QUERY_LATEST:
        this.write({ws:ws, message:this.getQueryForType({type:message.type})});
        break;
      case MessageType.QUERY_ALL:
        this.write({ws:ws, message:this.getQueryForType({type:message.type})});
        break;
      case MessageType.RESPONSE_BLOCKCHAIN:
        this.handleBlockchainResponse({message:message});
        break;
    }
  };

  getQueryForType(params){
    let { type } = params;
    switch (type) {
      case MessageType.QUERY_LATEST: return  {
        'type': MessageType.RESPONSE_BLOCKCHAIN,
        'data': JSON.stringify([Blockchain.getLatestBlock()])
      }
      case MessageType.QUERY_ALL: return  {
        'type': MessageType.RESPONSE_BLOCKCHAIN,
        'data': JSON.stringify(Blockchain.chain)
      }
      default: return;

    }
  }

  handleBlockchainResponse(params) {
    let {message} = params;
    var receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
    var latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    var latestBlockHeld = Blockchain.getLatestBlock();
    if (latestBlockReceived.index > latestBlockHeld.index) {
      console.log('blockchain possibly behind. We got: ' + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
      if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
        console.log("We can append the received block to our chain");
        Blockchain.chain.push(latestBlockReceived);
        this.broadcast({message:this.getQueryForType({type:MessageType.QUERY_LATEST})});
      } else if (receivedBlocks.length === 1) {
        console.log("We have to query the chain from our peer");
      this.broadcast({message:this.getQueryForType({type:MessageType.QUERY_ALL})});
      } else {
        console.log("Received blockchain is longer than current blockchain");
        if (Blockchain.replaceChain(receivedBlocks))
          this.broadcast({message:this.getQueryForType({type:MessageType.QUERY_LATEST})});
        }
      } else {
      console.log('received blockchain is not longer than received blockchain. Do nothing');
    }
  };

  initErrorHandler(params) {
    let {ws} = params;
    ws.on('close', () => this.closeConnection({ws:ws}));
    ws.on('error', () => this.closeConnection({ws:ws}));
  };

  closeConnection(params) {
    let {ws} = params;
    console.log('connection failed to peer: ' + ws.url);
    this.sockets.splice(this.sockets.indexOf(ws), 1);
  };
  write(params) {
    let {ws,message} = params;
    console.log("Sending",JSON.stringify(message))
    return ws.send(JSON.stringify(message))
  };
  broadcast(params) {
    let {message} = params;
    return this.sockets.forEach(socket => this.write({ws:socket, message:message}))
  };
}

var instance = new P2P();
Object.freeze(instance);
export default instance;
