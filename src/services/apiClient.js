const interServerRequestKey  = require('../../config/config').interServerRequestKey;
const {getSocket} = require('../../socket');
const socket = getSocket();

const socketRequest = async (eventName, data) => {
   data.key = interServerRequestKey;
   const result = await new Promise((resolve) => {
      socket.emit(eventName, data);
      socket.on(`${eventName}-response`, ({key, data})=>{
          if(key !== interServerRequestKey){
               throw new Error("Invalid Request key from main server");
          }
          resolve(data);
      });
   });

   return result;
}

module.exports.mongoDBModels = asyncHandler(async (executionString)=>{
    return await socketRequest('mongodb-models', {executionString});
 })

module.exports.onConsoleLog = asyncHandler(async (projectId, log)=>{
     return await socketRequest('console-log', {projectId, log});
})

module.exports.updateStatus = asyncHandler(async (projectId, status)=>{
     return await socketRequest('update-status', {projectId, status});
})

module.exports.updatePackageJson = asyncHandler(async (projectId, content)=>{
     return await socketRequest('update-package-json', {projectId, content});
})

module.exports.getFileOrFolderPath = asyncHandler(async (id, isFile)=>{
     return await socketRequest('get-file-folder-path', {id, isFile});
})

