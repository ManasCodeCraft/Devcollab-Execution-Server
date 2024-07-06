const axios = require('axios');
const interServerRequestKey  = require('../../config/config').interServerRequestKey;
const mainServerURL = require('../../config/config').mainServerURL;

const axiosRequest = async (url, options) => {
     url = mainServerURL + "/from-execution-server" + url;
     options.interServerRequestKey = interServerRequestKey;
     return await axios.post(url, options);
}

module.exports.mongoDBModels = asyncHandler(async (executionString)=>{
    const response = await axiosRequest('/mongodb-models', { executionString });
    const data = await response.data;
    return data;
 })

module.exports.onConsoleLog = asyncHandler(async (projectId, log)=>{
     const response = await axiosRequest('/console-log', {projectId, log})
     const data = await response.data;
     return data;
})

module.exports.updateStatus = asyncHandler(async (projectId, status)=>{
     const response = await axiosRequest('/update-status', { projectId, status })
     const data = await response.data;
     return data;
 })