const ClientAppManager = require("../core/ClientAppManager");
const fs = require("fs-extra");
const path = require("path");
const { NodeVM } = require("vm2");
const {
  ClientProjectPath,
  getEntryFile,
  modifyAppFile,
  clientProjectTemplatePath,
  ClientProjectBaseDirPath,
} = require("../utils/clientProjectUtils");
const { copyProjectfromDatabase } = require("./localProjectServices");
const { onConsoleLog, updateStatus } = require("./apiClient");
const { executeCommand } = require("../utils/executeCommand");

module.exports.initialExecute = asyncHandler(async (projectId, userId)=>{
  const client_project_path = ClientProjectPath(projectId);
  const client_basedir_path = ClientProjectBaseDirPath(projectId);
  const templatePath = clientProjectTemplatePath();
  await fs.copy(path.join(templatePath, 'project'), client_project_path);
  await fs.copy(path.join(templatePath, 'program_run.js'), path.join(client_basedir_path, 'program_run.js'));
  await module.exports.runClientProject(projectId);
})

module.exports.runClientProject = asyncHandler(async (projectId) => {
  const client_project_path = ClientProjectPath(projectId);
  if (!fs.existsSync(client_project_path)) {
     if(await copyProjectfromDatabase(projectId)){
        await executeCommand('npm init -y', client_project_path)
        await executeCommand("npm install", client_project_path);
     }
     else return;
  }
  const entry_file_name = await getEntryFile(client_project_path);
  if (!entry_file_name) {
    throw new Error("Entry file not found");
  }
  const entryFilePath = path.join(client_project_path, entry_file_name);

  const code = await fs.readFile(entryFilePath, "utf-8");

  const vm = new NodeVM({
    timeout: 1000*60*60*3,
    console: "redirect",
    sandbox: {},
    require: {
      builtin: ["*"],
      external: true,
      root: [client_project_path],
    },
  });

  vm.on("console.log", async (message) => {
    await onConsoleLog(projectId, {
      project: projectId,
      details: message,
      type: "console",
    });
  });

  vm.on("console.error", async (message) => {
    await onConsoleLog(projectId, {
      project: projectId,
      details: message,
      type: "error",
    });
  });

  try{
    var {app, closeServer} = vm.run(code, entryFilePath);
    if(typeof app !== 'function'){
        await modifyAppFile(entryFilePath);
        await module.exports.runClientProject(projectId);
        return;
    }
    
    ClientAppManager.addClientApp(projectId, [vm, app, closeServer]);
    const { setUpRoute } = require('../core/setUpRoutes');
    await setUpRoute(projectId);
    return app;
  } catch(error) {
     const errorMessage = error.toString().replace('VMError:', '');
     await onConsoleLog(projectId, {
      project: projectId,
      details: errorMessage,
      type: "error",
     })
     console.error('Error running app in nodevm - ', error);
     updateStatus(projectId, 'crashed');

     return null;
  }

});

