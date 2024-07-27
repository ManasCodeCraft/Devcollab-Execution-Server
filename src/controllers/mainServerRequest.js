const { connectMainServer } = require("../../socket")


module.exports.reconnectServer = asyncRequestHandler(async function (req, res, next){
    connectMainServer();
    res.status(200).send();
})

