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

  await new Promise.all(projects.map((project)=>{
     return start(project);
  }))
};

async function start(project) {
  const { runClientProject } = require("../services/runNodejsServices");
  if (project.runningStatus === "running") {
    console.log("Starting - ", project._id);
    await runClientProject(project._id);
  }
}

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
