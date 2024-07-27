const { ClientProjectPath, clientProjectTemplatePath, ClientProjectBaseDirPath } = require("../utils/clientProjectUtils");
const { fork } = require('child_process');
const { ClientProgramManager } = require("../core/ClientProgramManager");
const { mainServerURL } = require('../../config/config')
const io = require('socket.io-client');
const runningStatusSocket = io(`${mainServerURL}/running-status-socket`);
const path = require('path');
const fs = require('fs-extra');
const consoleLogSocket = io(`${mainServerURL}/console-log-socket`);

module.exports.runNodejsProgram = asyncHandler(async (fileId, projectId, filePath, fileName)=>{
    const runProgramPath = path.join(ClientProjectBaseDirPath(projectId), 'program_run.js');
    if(!(await fs.exists(runProgramPath))){
        const templatePath = path.join(clientProjectTemplatePath(),'program_run.js' )
        await fs.copy(templatePath, runProgramPath)
    }

    const new_process = fork(runProgramPath, {env: {client_project_path:ClientProjectPath(projectId), filePath, mainServerURL, projectId, fileName}});
    runningStatusSocket.emit('program-update-status', {projectId, userId: null, status: 'running'})

    new_process.on('exit', ()=>{
        ClientProgramManager.removeProgram(projectId);
        runningStatusSocket.emit('program-update-status', {projectId, userId: null, status: 'not running'})
    })

    new_process.on('message', async ({log})=>{
        consoleLogSocket.emit('send-program-log',{
            projectId,
            fileName,
            log
        })
    })
    const pid = new_process.pid;
    ClientProgramManager.addProgram(projectId, fileId, filePath, pid);

})

module.exports.stopNodejsProgram = asyncHandler(async (projectId)=>{
    ClientProgramManager.terminateProgram(projectId);
    runningStatusSocket.emit('program-update-status', {projectId, userId: null, status: 'not running'})
    return;
})
