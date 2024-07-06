const mongoose = require("mongoose");

class vmData{
    vm;
    app;
    closeServer;
    constructor(vm, app, closeServer){
      if(!vm || !app || !closeServer){
          const rq = [vm, app, closeServer].filter((prop)=>!prop);
          throw {
             name: 'vmData Validation Failed',
             reason: `undefined value for ${rq.join(',')}`,
             error: new Error()
          }
      }
      this.vm = vm;
      this.app = app;
      this.closeServer = closeServer;
    }
}

class ClientAppManager {
  static appStore = new Map();

  static convertObjectIdToString(value) {
    if (typeof value === "string") {
      return value;
    } else if (
      mongoose.Types.ObjectId.isValid(value) &&
      value instanceof mongoose.Types.ObjectId
    ) {
      return value.toString();
    } else {
      const error = new Error("id is not of type string or mongoose object id");
      error.name = "TypeFormatError";
      error.source = "client app manager";
      throw error;
    }
  }

  static addClientApp(projectId, data){
     var app = new vmData(...data);
     projectId = this.convertObjectIdToString(projectId);
     this.appStore.set(projectId, app)
  }

  static removeClientApp(projectId){
    this.appStore.delete(projectId);
  }

  static getApp(projectId) {
    projectId = this.convertObjectIdToString(projectId);
    let data = this.appStore.get(projectId);
    if(!data) return null;
    return data.app;
  }

  static getVm(projectId){
    projectId = this.convertObjectIdToString(projectId);
    let data = this.appStore.get(projectId);
    return data.vm;
  }

  static closeServer(projectId) {
    projectId = this.convertObjectIdToString(projectId);
    let data = this.appStore.get(projectId);
    if(!data) return null;
    data.closeServer();
    this.appStore.delete(projectId);
  }
}

module.exports = ClientAppManager;
