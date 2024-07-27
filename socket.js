const io = require("socket.io-client");
const mainServerURL = require("./config/config").mainServerURL;

var socket = null;

function connectMainServer() {
  socket = io(`${mainServerURL}/execution-server-socket`);
  return new Promise(resolve=>{
    socket.once("connect", () => {
      console.log("Connected to main server");
      resolve();
    });
  })
}

connectMainServer();

module.exports.getSocket = () => {
  if (!socket) {
    connectMainServer();
  }
  return socket;
};

module.exports.connectMainServer = connectMainServer;
