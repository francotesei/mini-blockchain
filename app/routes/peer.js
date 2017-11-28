import P2P from '../model/P2P';

var listPeers = (req,res) => {
  res.send(P2P.listPeers());
}

var addPeers = (req,res) => {
  res.send(P2P.connectToPeers({peers:req.body.peers}));
}

export {listPeers,addPeers};
