const esprima = require("esprima");
const estraverse = require("estraverse");
const escodegen = require("escodegen");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.getEntryFile = asyncHandler(async (client_project_path) => {
  const entryfile = getEntryFileFromPackageJson(client_project_path);
  if (entryfile) {
    return entryfile;
  }
  const possibleEntryFiles = ["app.js", "server.js", "index.js"];
  const foundFiles = await Promise.all(
    possibleEntryFiles.filter(async (file) => {
      if (await fs.pathExists(path.join(client_project_path, file))) {
        return file;
      } else {
        return null;
      }
    })
  );

  if (foundFiles.length > 0) {
    return foundFiles[0];
  } else {
    throw new Error("Unable to find entry file");
  }
});

const getEntryFileFromPackageJson = syncHandler((client_project_path) => {
  const packageJsonPath = path.join(client_project_path, "package.json");

  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);

      if (packageJson.main && fs.existsSync(path.join(client_project_path, packageJson.main))) {
        return packageJson.main;
      }
    } catch (error) {
      console.error("Error reading or parsing package.json:", error);
    }
  }

  return null;
});

module.exports.ClientProjectPath = function ClientProjectPath(projectId) {
  const client_project_dir = path.join(__dirname, "../../ClientProjects");
  const client_project_path = path.join(
    client_project_dir,
    `project_${projectId}`,
    'project'
  );
  return client_project_path;
};

module.exports.NodeModulesPath = function (projectId) {
  return path.join(__dirname, "../../ClientProjects", `project_${projectId}`, 'node_modules');
};

module.exports.ClientProjectBaseDirPath = function(projectId){
  return path.join(__dirname, "../../ClientProjects", `project_${projectId}`);
}

module.exports.modifyAppFile = asyncHandler(async (filePath) => {
  const code = await fs.readFile(filePath, "utf8");
  let ast = esprima.parseScript(code, { range: true });

  let expressVarName = null;
  let appListenNodes = [];

  estraverse.traverse(ast, {
    enter: function (node, parent) {
      if (
        node.type === "VariableDeclarator" &&
        node.init &&
        node.init.type === "CallExpression" &&
        node.init.callee.name === "express"
      ) {
        expressVarName = node.id.name;
      }

      if (
        node.type === "CallExpression" &&
        node.callee.type === "MemberExpression" &&
        node.callee.object.name === expressVarName &&
        node.callee.property.name === "listen"
      ) {
        appListenNodes.push(parent);
      }
    },
  });

  appListenNodes.forEach((node) => {
    const index = ast.body.indexOf(node);
    if (index !== -1) {
      ast.body.splice(index, 1);
    } else {
      estraverse.replace(ast, {
        enter: function (n, p) {
          if (n === node) {
            return estraverse.VisitorOption.Remove;
          }
        },
      });
    }
  });

  if (expressVarName) {
    const httpRequireNode = esprima.parseScript(
      `const http = require('http');`
    ).body[0];

    const serverCreateNode = esprima.parseScript(
      `const server = http.createServer(${expressVarName});`
    ).body[0];

    const exportNode = esprima.parseScript(
      `module.exports = {
        app: ${expressVarName},
        closeServer: () => global = undefined
      };`
    ).body[0];

    ast.body.unshift(httpRequireNode); // Add the require statement at the top
    ast.body.push(serverCreateNode); // Add the server creation statement
    ast.body.push(exportNode); // Add the export statement
  } else {
    throw new Error("Express variable not found.");
  }

  const modifiedCode = escodegen.generate(ast);
  await fs.writeFile(filePath, modifiedCode, "utf8");

  return modifiedCode;
});

module.exports.checkForEntryFile = asyncHandler(async (localFilePath) => {
  const filestat = fs.statSync(localFilePath);
  if (filestat.isDirectory()) {
    console.error(
      "Path belongs to a directory (in function checkEntryFile)",
      localFilePath
    );
    return false;
  }
  const projectId = getProjectIdFromLocalPath(localFilePath);
  if (!projectId) {
    console.error(
      "failed to detect projectId from localFilePath",
      localFilePath
    );
    return false;
  }
  const entry_file = await module.exports.getEntryFile(projectId);
  if (!entry_file) {
    console.log("failed to detect app file", localFilePath, entry_file);
    return false;
  }
  if (path.basename(localFilePath) == entry_file) {
    return true;
  }

  return false;
});

const getProjectIdFromLocalPath = syncHandler((localFilePath) => {
  const starting_path = module.exports.ClientProjectPath("");
  const startIdx = localFilePath.indexOf(starting_path);

  const substringStartIdx = startIdx + starting_path.length;
  const nextSlashIdx = localFilePath.indexOf("/", substringStartIdx);
  const nextBackslashIdx = localFilePath.indexOf("\\", substringStartIdx);

  let endIdx;
  if (nextSlashIdx === -1 && nextBackslashIdx === -1) {
    endIdx = localFilePath.length;
  } else if (nextSlashIdx === -1) {
    endIdx = nextBackslashIdx;
  } else if (nextBackslashIdx === -1) {
    endIdx = nextSlashIdx;
  } else {
    endIdx = Math.min(nextSlashIdx, nextBackslashIdx);
  }

  const projectId = localFilePath.slice(substringStartIdx, endIdx);
  return projectId;
});


module.exports.downloadImageFromCloudinary = asyncHandler(async (url, localFilePath) => {
  const response = await axios({
    url: url,
    responseType: "stream",
  });
  const writer = fs.createWriteStream(localFilePath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
});
