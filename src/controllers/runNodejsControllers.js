const ClientAppManager = require("../core/ClientAppManager");
const { initialExecute, runClientProject } = require("../services/runNodejsServices");
const {execSync} = require('child_process');
const { ClientProjectPath } = require("../utils/clientProjectUtils");
const { closeClientServer } = require("../core/setUpRoutes");

module.exports.initProject = asyncRequestHandler(async (req, res, next) => {
  const projectId = req.body.projectId;
  const userId = req.body.userId;
  await initialExecute(projectId, userId);

  res.status(200).send();
});

module.exports.stopClientProject = asyncRequestHandler(async (req, res, next) =>{
  const projectId = req.body.projectId;
  if(!projectId){
    throw errorObj(400, "Invalid Project");
  }
  ClientAppManager.closeServer(projectId)
  closeClientServer(projectId);
  res.status(200).send();
})


module.exports.startClientProject = asyncRequestHandler(async (req, res, next)=>{
  const projectId = req.body.projectId;
  if(!projectId){
    throw errorObj(400, "Invalid Project");
  }
  await runClientProject(projectId)
  res.status(200).send();
})

module.exports.reloadClientProject = asyncRequestHandler(async (req, res, next)=>{
  const projectId = req.body.projectId;
  if(!projectId){
    throw errorObj(400, "Invalid Project");
  }
  await runClientProject(projectId)
  res.status(200).send();
})

module.exports.installNodejsPackage = asyncRequestHandler(async (req, res, next)=>{
  const packageName = req.body.packageName;
  const projectId = req.body.projectId;

  if(!packageName ||!projectId){
    throw errorObj(400, "Invalid Project or Package");
  }
  execSync(`npm install ${packageName}`, {cwd: ClientProjectPath(projectId)})
  res.status(200).send();
})

module.exports.runNPMInstall = asyncRequestHandler(async (req,res,next)=>{
  const projectId = req.body.projectId;
  if(!projectId){
    throw errorObj(400, "Invalid Project");
  }
  execSync(`npm install`, {cwd: ClientProjectPath(projectId)})
  res.status(200).send();
})