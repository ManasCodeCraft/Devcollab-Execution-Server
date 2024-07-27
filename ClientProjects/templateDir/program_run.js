const {NodeVM } = require('vm2');
const fs = require('fs-extra')

const client_project_path = process.env.client_project_path;
const filePath = process.env.filePath;
const fileName = process.env.fileName;
const projectId = process.env.projectId;

const programEndKey = '989klndkjlk9fkslkjks9n';
var key = 0;

const modifyFile = async ()=>{
   var content = await fs.readFile(filePath, 'utf-8');
   term = `
     console.log('${programEndKey}')
   `
   if(content.indexOf(term) !== -1) return;
   content += term;
   await fs.writeFile(filePath, content, 'utf-8');
}

async function runProgram(){
  await modifyFile();

  const vm = new NodeVM({
      console: "redirect",
      sandbox: {},
      require: {
        builtin: ["*"],
        external: true,
        root: [client_project_path],
      },
    });
  
    vm.on("console.log", async (message) => {
      const logKey = ++key;
      if(message == programEndKey){
         process.exit(0);
      }
      const log = {
          project: projectId,
          details: message,
          type: "console",
          key: logKey,
      }
      process.send({log});
    });
  
    vm.on("console.error", async (message) => {
      const logKey = ++key;
      const log = {
          project: projectId,
          details: message,
          type: "error",
          key: logKey,
      }
      process.send({log});
    });
  
  const code = await fs.readFile(filePath, 'utf-8')
  
  vm.run(code, filePath);
}


runProgram();
