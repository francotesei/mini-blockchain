import {default as express} from 'express';
import {default as bodyParser} from 'body-parser';
import {default as morgan} from 'morgan'
import {default as routes} from './routes/index';
import {default as WebSocket} from 'ws';
import {default as discovery } from 'dns-discovery';
import P2P from './model/P2P'

const http_port = process.env.HTTP_PORT || 3001;
const p2p_port = process.env.P2P_PORT || 6001;
const discoverPeers = process.env.DISCOVER_PEERS || false;
const initialPeers = process.env.PEERS
  ? process.env.PEERS.split(',')
  : [];

var initHttpServer = () => {
  var app = express();
  app.use(bodyParser.json());
  app.use(morgan('combined'));
  routes(app);
  app.listen(http_port, () => console.log('Listening http on port: ' + http_port));
}

var initP2PServer = () => {
  var server = new WebSocket.Server({port: p2p_port});
  var myServ = discovery();
  server.on('connection', ws => P2P.initConnection({ws:ws}));
  // announce an app
  myServ.announce('node-app', p2p_port)
  console.log('listening websocket p2p port on: ' + p2p_port);
};

var initDiscoveryPeers = ()=> {
  var disc = discovery();
  disc.on('peer', function (name, peer) {
    console.log("New Peer Added");
    console.log(name, peer);
    P2P.connectToPeers({peers:['ws://'+peer.host+':'+peer.port]});
  });
};



P2P.connectToPeers({peers:initialPeers});
initHttpServer();
initP2PServer();
if(discoverPeers) initDiscoveryPeers();
