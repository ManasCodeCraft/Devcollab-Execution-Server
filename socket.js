const io = require('socket.io-client');
const mainServerURL = require('./config/config').mainServerURL;

const socket = io(`${mainServerURL}/execution-server-socket`);

module.exports.getSocket = ()=>{
    return socket;
}