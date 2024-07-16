const archiver = require("archiver");
const { ClientProjectPath } = require("../utils/clientProjectUtils");

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
