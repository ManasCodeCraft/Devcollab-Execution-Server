const config = require("../../config/config");
const { getAllProjects } = require("../services/databaseOperations");

var server = null;

module.exports.initServer = function initServer(app) {
  server = app;
};


module.exports.setUpClientProjectRoutes = async function () {
  if (!server) {
    console.error("Server is not available");
    return;
  }

  const projects = await getAllProjects();
  const { runClientProject } = require("../services/runNodejsServices");

  for (let project of projects) {
    await runClientProject(project._id);
    await module.exports.setUpRoute(project._id);
  }
};

module.exports.setUpRoute = asyncHandler(async (projectId) => {
  const devcollabKey = config.mainServerConfig.devcollabKey;
  const key = `${devcollabKey}_projectId`;

  server.use(`/client-project/${projectId}`, (req, res, next) => {
    req[key] = projectId;
    next();
  });

  const {
    validateUser,
    serveClientApp,
  } = require("../middlewares/runNodejsMiddlewares");
  // server.use(`/client-project/${projectId}`, validateUser);

  server.use(`/client-project/${projectId}`, serveClientApp);

});

