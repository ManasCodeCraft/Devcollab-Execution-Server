const { exec }  = require('child_process')

module.exports.executeCommand = asyncHandler(async (command, dirPath)=>{
   return new Promise(function (resolve, reject) {
     exec(command, {cwd: dirPath} ,(error, stdout, stderr) => {
       if (error) {
         reject(stderr)
       } else {
         resolve(stdout)
       }
     })
   })
})