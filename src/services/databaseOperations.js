const { mongoDBModels } = require("./apiClient")

module.exports.getAllProjects = asyncHandler(async () => {
    const allProjects = await mongoDBModels(`await Project.find()`);
    return allProjects;
}) 

module.exports.validCollaborator = asyncHandler(async (projectId, userId) => {
    const project = await mongoDBModels(`await Project.findById('${projectId}')`);
    if (!project) return false;
    if(project.collaborators.includes(userId.toString())){
        return true;
    }
    return false;
})

module.exports.getProjectById = asyncHandler(async (projectId)=>{
    const project = await mongoDBModels(`await Project.findById('${projectId}')`);
    if (!project) return null;
    return project;
})

module.exports.getFileById = asyncHandler(async (fileId)=>{
    const file = await mongoDBModels(`await File.findById('${fileId}')`);
    if (!file) return null;
    return file;
})

module.exports.getDirectoryById = asyncHandler(async (dirId)=>{
    const directory = await mongoDBModels(`await Directory.findById('${dirId}')`);
    if (!directory) return null;
    return directory;
})
