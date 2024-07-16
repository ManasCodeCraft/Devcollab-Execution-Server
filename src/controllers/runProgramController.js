const { getFileOrFolderPath } = require("../services/apiClient");
const { runNodejsProgram, stopNodejsProgram } = require("../services/runPrograms");
const { formatClientFileFolderPath } = require("../utils/clientProjectUtils");
const path = require('path')

module.exports.runNodejsProgram = asyncRequestHandler(async (req, res, next)=>{
   const { projectId, fileId } = req.body;
   const filePath = req.filePath;
   const fileName = req.fileName;
   await runNodejsProgram(fileId, projectId, filePath, fileName)
   return res.status(200).send();
})

module.exports.killNodejsProgram = asyncRequestHandler(async (req,res,next)=>{
    const projectId = req.body.projectId;
    await stopNodejsProgram(projectId);
    return res.status(200).send();
})

module.exports.htmlPreview = asyncRequestHandler(async (req, res, next)=>{
    const fileId = req.params.fileId;
    const projectId = req.params.projectId;
    if(!fileId) throw errorObj(404);

    const filePath = await getFileOrFolderPath(fileId, true);
    if(filePath[filePath.length - 1].split('.').pop() !== 'html') throw errorObj(400);

    const htmlFilePath = formatClientFileFolderPath(filePath, projectId);

    res.status(200).sendFile(path.resolve(htmlFilePath));
})