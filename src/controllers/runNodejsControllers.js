const ClientAppManager = require("../core/ClientAppManager");
const { runClientProject } = require("../services/runNodejsServices");
const {execSync} = require('child_process');
const { ClientProjectPath } = require("../utils/clientProjectUtils");
const { updateStatus, updatePackageJson } = require("../services/apiClient");
const { executeCommand } = require("../utils/executeCommand");
const path = require("path");
const fs = require('fs-extra')


module.exports.stopClientProject = asyncRequestHandler(async (req, res, next) =>{
  const projectId = req.body.projectId;
  if(!projectId){
    throw errorObj(400, "Invalid Project");
  }
  try{
  ClientAppManager.closeServer(projectId)
  } catch(e){};
  
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
  await updateStatus(projectId, 'running');
  res.status(200).send();
})

module.exports.installNodejsPackage = asyncRequestHandler(async (req, res, next)=>{
  const packageName = req.body.packageName;
  const projectId = req.body.projectId;

  if(!packageName ||!projectId){
    throw errorObj(400, "Invalid Project or Package");
  }

  await executeCommand(`npm install ${packageName}`, ClientProjectPath(projectId))
  await updatePackageFile(projectId);

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

async function updatePackageFile(projectId){
  const content = await fs.readFile(path.join(ClientProjectPath(projectId), 'package.json'));
  await updatePackageJson(projectId, content);
}