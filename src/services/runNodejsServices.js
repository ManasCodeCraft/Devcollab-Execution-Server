const ClientAppManager = require("../core/ClientAppManager");
const fs = require("fs-extra");
const path = require("path");
const { NodeVM } = require("vm2");
const io = require("socket.io-client");
const {
  ClientProjectPath,
  getEntryFile,
  NodeModulesPath,
  ClientProjectBaseDirPath,
} = require("../utils/clientProjectUtils");
const { copyProjectfromDatabase } = require("./localProjectServices");
const { onConsoleLog, updateStatus } = require("./apiClient");
const { mainServerURL } = require("../../config/config")
const { execSync } = require('child_process')

module.exports.initialExecute = asyncHandler(async (projectId, userId) => {
  await copyProjectfromDatabase(projectId);
  const socket = io(`${mainServerURL}/waiting-modal-socket`)

  socket.emit('trigger-change-text', {userId, text: 'Installing packages... Please wait'})

  execSync('npm init -y', {cwd: ClientProjectPath(projectId)})
  execSync('npm install', {cwd: ClientProjectPath(projectId)})

  await module.exports.runClientProject(projectId);
  const { setUpRoute } = require("../core/setUpRoutes");

  await setUpRoute(projectId);
});

module.exports.runClientProject = asyncHandler(async (projectId) => {
  const client_project_path = ClientProjectPath(projectId);
  if (!fs.existsSync(client_project_path)) {
    return;
  }
  const entry_file_name = await getEntryFile(client_project_path);
  if (!entry_file_name) {
    throw new Error("Entry file not found");
  }
  const entryFilePath = path.join(client_project_path, entry_file_name);

  const code = await fs.readFile(entryFilePath, "utf-8");

  const vm = new NodeVM({
    console: "redirect",
    sandbox: {},
    require: {
      builtin: ["*"],
      external: true,
      root: [client_project_path],
      // resolve: (moduleName) => {
      //   if (moduleName.startsWith("./") || moduleName.startsWith("../")) {
      //     return path.resolve(projectPath, moduleName);
      //   } else {
      //     return require.resolve(moduleName, {
      //       paths: [node_modules_dir],
      //     });
      //   }
      // },
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
    const {app, closeServer} = vm.run(code, entryFilePath);
    ClientAppManager.addClientApp(projectId, [vm, app, closeServer]);
    return app;
  } catch(error) {
     const errorMessage = error.toString().replace('VM Error:', '');
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

