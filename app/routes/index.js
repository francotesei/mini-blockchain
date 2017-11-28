import * as root from './root';
import * as block from './block';
import * as peer from './peer';

export default function(app) {

  app.route('/')
  .get(root.initialMsg)

  app.route('/blocks')
  .get(block.getBlocks)
  .post(block.addBlock)

app.route('/peers')
  .get(peer.listPeers)
  .post(peer.addPeers)

}
