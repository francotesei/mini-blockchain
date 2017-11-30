import {default as express} from 'express';
import {default as bodyParser} from 'body-parser';
import {default as morgan} from 'morgan'
import {default as WebSocket} from 'ws';
import {default as discovery} from 'dns-discovery';
import {default as ip} from 'ip';
import {default as routes} from './routes/index';
import P2P from './model/P2P';

const http_port = process.env.HTTP_PORT || 8080;
const p2p_port = process.env.P2P_PORT || 433;
const discoverPeers = process.env.DISCOVER_PEERS || true;
const masterNode = process.env.MASTER_NODE || false;
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
  server.on('connection', ws => P2P.initConnection({ws: ws}));
  myServ.announce('local-node', p2p_port) // announce an app
  console.log('listening websocket p2p port on: ' + p2p_port);
};

var initDiscoveryPeers = () => {
  var disc = discovery();
  disc.on('peer', function(name, peer) {
    if (peer.host == ip.address() && peer.port == p2p_port) return;
    console.log("New peer discovered");
    console.log(name, peer);
    P2P.connectToPeers({
      peers: ['ws://' + peer.host + ':' + peer.port]
    });
    console.log("New Peer Added");
  });
};
/*
var saveNodeInfo = () => {

}
*/

P2P.connectToPeers({peers: initialPeers});
initHttpServer();
initP2PServer();
if (discoverPeers)
  initDiscoveryPeers();
