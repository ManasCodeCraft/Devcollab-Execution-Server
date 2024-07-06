const jwt = require("jsonwebtoken");
const ClientAppManager = require("../core/ClientAppManager");
const { validCollaborator } = require("../services/databaseOperations");
const devcollabKey = require("../../config/config").mainServerConfig
  .devcollabKey;
const authCookie = require("../../config/config").mainServerConfig.authCookie;
const jwtKey = require("../../config/config").mainServerConfig.jwtSecret;

module.exports.validateUser = asyncRequestHandler(async (req, res, next) => {
  const projectId = req[`${devcollabKey}_projectId`];
  const cookie = req.cookies[authCookie];
  if (!cookie) {
     throw errorObj(404)
  }
  if (!projectId) {
    throw errorObj(400, "Request Declined");
  }
  const userId = await new Promise((resolve, reject) => {
    jwt.verify(cookie, jwtKey, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded.id);
    });
  });
  if (await validCollaborator(projectId, userId)) {
    return next();
  }
   
  throw errorObj(404);
});


module.exports.serveClientApp = asyncRequestHandler(async (req, res, next) => {
  const projectId = req[`${devcollabKey}_projectId`];
  if(!projectId){
    throw errorObj(400, "Invalid Project");
  }
  const app = ClientAppManager.getApp(projectId);
  if (!app) {
    throw errorObj(404, "Not Found");
  }
  app(req, res, next);
});