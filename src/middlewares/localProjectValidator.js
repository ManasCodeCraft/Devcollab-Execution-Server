const { getProjectById } = require("../services/databaseOperations");


module.exports.validateDownload = asyncRequestHandler(async (req, res, next)=>{
    const projectId = req.params.projectId;
    const project = await getProjectById(projectId);
    if(project){
        req.projectId = project._id;
        req.projectName = project.name;
        return next();
    }
    throw errorObj(400);
 })