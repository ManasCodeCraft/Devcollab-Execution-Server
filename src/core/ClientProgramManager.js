
class ProgramData {
    fileId;
    filePath;
    pid;
    constructor (fileId, filePath, pid){
        this.fileId = fileId;
        this.filePath = filePath;
        this.pid = pid;
    }
}

class ClientProgramManager{
    static programContainer = new Map();

    static addProgram(projectId ,fileId, filePath, pid){
        if(this.programContainer.has(projectId)){
            return false;
        }
        const programData = new ProgramData(fileId, filePath, pid);
        this.programContainer.set(projectId, programData);
    }

    static terminateProgram(projectId){
        if(!this.programContainer.has(projectId)){
            return false;
        }
        const programData = this.programContainer.get(projectId);
        const pid = programData.pid;
        process.kill(pid, 'SIGTERM');
        return this.programContainer.delete(projectId);
    }

    static removeProgram(projectId){
        return this.programContainer.delete(projectId);
    }

    static ifProgram(projectId){
        return this.programContainer.has(projectId);
    }

}

module.exports.ClientProgramManager = ClientProgramManager;