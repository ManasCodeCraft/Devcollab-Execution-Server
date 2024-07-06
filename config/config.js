require('dotenv').config();
const axios = require('axios');
const cloudinary = require('cloudinary').v2;

// Initialize all values to null in mainServerConfig
var mainServerConfig = {
    // Database
    dbURL: null,

    // Server
    port: null,
    nodeEnv: null,
    baseURL: null,
    frontendURL: null,
    executionServerURL: null,

    maxAllowedProjects: null,

    // auth and keys
    jwtSecret: null,
    authCookie: null,
    devcollabKey: null,
    devcollabInterServerRequestKey: null,
    devcollabConfigKey: null,

    // nodemailer email
    mailId: null,
    mailPassword: null,
    mailHost: null,
    mailPort: null,

    // cloudinary
    cloudinary: null,
    cloudinaryConfig: null,

    // google api
    googleClientId: null,
    googleClientSecret: null,
    googleCallbackUrl: null,
};

// Initialize other variables
var baseURL = `http://localhost:${process.env.PORT}`;
var mainServerURL = `http://localhost:7000`;
if (process.env.NODE_ENV === 'production') {
    baseURL = 'https://devcollab-execution-server.onrender.com';
    mainServerURL = 'https://devcollab-server.onrender.com';
}

var executionServerConfig = {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    baseURL: baseURL,
    mainServerURL: mainServerURL,
    interServerRequestKey: process.env.DEVCOLLAB_INTER_SERVER_REQUEST_KEY,
    configKey: process.env.DEVCOLLAB_CONFIG_KEY
};

const getMainServerConfig = asyncHandler(async ()=>{
        let response = await axios.post(`${mainServerURL}/from-execution-server/server-config`, {
            interServerRequestKey: executionServerConfig.interServerRequestKey
        });
        const data = await response.data;
        for (let key of Object.keys(data)) {
            mainServerConfig[key] = data[key];
        }
        mainServerConfig.cloudinary = cloudinary.config(mainServerConfig.cloudinaryConfig);
    })



module.exports = {
    mainServerConfig: mainServerConfig,
    getMainServerConfig,
    ...executionServerConfig
};
