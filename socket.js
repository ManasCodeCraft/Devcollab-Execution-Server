const io = require("socket.io-client");
const mainServerURL = require("./config/config").mainServerURL;

var socket = null;

function connectMainServer() {
  socket = io(`${mainServerURL}/execution-server-socket`);
}

connectMainServer();

module.exports.getSocket = () => {
  if (!socket) {
    connectMainServer();
  }
  return socket;
};

module.exports.connectMainServer = connectMainServer;
