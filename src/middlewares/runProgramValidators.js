const { getFileOrFolderPath } = require("../services/apiClient");
const fs = require('fs-extra');
const { isBinaryFile } = require('isbinaryfile');
const { formatClientFileFolderPath } = require("../utils/clientProjectUtils");
const { ClientProgramManager } = require("../core/ClientProgramManager");

module.exports.validateExecNodejsProgram = asyncRequestHandler(async (req, res, next)=>{
    const {projectId, fileId} = req.body;
    if(!projectId || !fileId) throw errorObj(400);

    if(ClientProgramManager.ifProgram(projectId)) throw errorObj(409, "A program is already running");

    const pathArray = await getFileOrFolderPath(fileId, true);
    const filePath = formatClientFileFolderPath(pathArray, projectId);
    const code = await fs.readFile(filePath);
    if(await isBinaryFile(code)){
        throw errorObj(400, 'File is not executable');
    }
    req.filePath = filePath;
    req.fileName = pathArray[pathArray.length - 1];
    next();
})