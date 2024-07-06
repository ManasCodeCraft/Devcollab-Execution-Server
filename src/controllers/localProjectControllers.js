const { manageOnLocal, deleteProject, createEmptyProject } = require("../services/localProjectServices");
const archiver = require("archiver");
const fs = require("fs-extra");
const { ClientProjectPath } = require("../utils/clientProjectUtils");

module.exports.deleteClientProject = asyncRequestHandler(
  async (req, res, next) => {
    const projectId = req.body.projectId;
    if (!projectId) {
      throw errorObj(400);
    }
    await deleteProject(projectId);
    return res.status(200).send();
  }
);

module.exports.onLocal = asyncRequestHandler(async (req, res, next) => {
  const { id, isFile, task, nameOrContent } = req.body;
  await manageOnLocal(id, isFile, task, nameOrContent);
  res.status(200).send();
});

module.exports.createEmpty = asyncRequestHandler(async (req, res, next)=>{
   const projectId = req.body.projectId;
   if (!projectId) {
     throw errorObj(400);
   }
   await createEmptyProject(projectId);
   res.status(200).send();
})

module.exports.downloadProject = asyncRequestHandler(async function (req, res, next) {
    const projectId = req.projectId;
    const projectName = req.projectName;
    const dirPath = ClientProjectPath(projectId);
  
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });
  
    archive.on("error", function (err) {
      throw err;
    });
  
    res.attachment(`${projectName}.zip`);
  
    archive.pipe(res);
  
    archive.directory(dirPath, false);
  
    await archive.finalize();
    res.end()
  });
