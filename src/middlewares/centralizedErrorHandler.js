const config = require("../../config/config");

module.exports = async function (err, req, res, next){

     const statusCode = err.statusCode || 500;
     const message = err.message || 'Internal Server Error';

     var messageToSend = (statusCode === 500)? 'Internal Server Error' : message;

     if(config.nodeEnv !== 'production'){
        // devlopment environment
        console.error(`Error: ${message}`);
        console.error(`Stacktrace: ${err.stack}`);
     }
     else{
        // production environment
        if(statusCode >= 500){
            console.error(`Error: ${message}`);
        }
     }

     if(err.sendEmptyResponse){
        return res.status(statusCode).send();
     }

     res.status(statusCode).json({ message: messageToSend });
}