  const {
    manageOnLocal,
    createEmptyProject,
    deleteProject,
  } = require("./localProjectServices");
  const { initialExecute, runClientProject } = require("./runNodejsServices");
  const ClientAppManager = require("../core/ClientAppManager");
  const interServerRequestKey =
    require("../../config/config").interServerRequestKey;
  
module.exports.setUpSocketListeners = async (socket)=>{

  socket.on(
    "on-local-crud",
    async ({ key, id, isFile, task, nameOrContent }) => {
      if (key === interServerRequestKey) {
        await manageOnLocal(id, isFile, task, nameOrContent);
      }
      socket.emit("on-local-crud-response");
    }
  );

  socket.on("run-nodejs-init", async ({ key, projectId, userId }) => {
    if (key === interServerRequestKey) {
      console.log('got request run nodejs')
      await initialExecute(projectId, userId);
    }
    socket.emit("run-nodejs-init-response");
  });

  socket.on("on-local-create-empty", async ({ key, projectId }) => {
    if (key === interServerRequestKey) {
      await createEmptyProject(projectId);
    }
    socket.emit("on-local-create-empty-response");
  });

  socket.on("on-local-delete", async ({ key, projectId }) => {
    if (key === interServerRequestKey) {
      await deleteProject(projectId);
    }
    socket.emit("on-local-delete-response");
  });

  socket.on("run-nodejs-start", async ({ key, projectId }) => {
    if (key === interServerRequestKey) {
      await runClientProject(projectId);
    }
    socket.emit("run-nodejs-start-response");
  });

  socket.on("run-nodejs-stop", async ({ key, projectId }) => {
    if (key === interServerRequestKey) {
      ClientAppManager.closeServer(projectId);
    }
    socket.emit("run-nodejs-stop-response");
  });

}
