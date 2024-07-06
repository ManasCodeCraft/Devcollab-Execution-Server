const config = require('../../config/config');

module.exports.validateMainServer = asyncRequestHandler(async (req, res, next)=>{
    if(config.interServerRequestKey === req.body.interServerRequestKey){
        return next();
    }
    throw errorObj(401, "Invalid Inter Server Request Key");
})