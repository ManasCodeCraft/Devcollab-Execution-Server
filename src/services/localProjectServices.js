const fs = require("fs-extra");
const path = require("path");
const {
  ClientProjectPath,
  checkForEntryFile,
  getEntryFile,
  modifyAppFile,
  downloadImageFromCloudinary,
  ClientProjectBaseDirPath,
  formatClientFileFolderPath,
} = require("../utils/clientProjectUtils");
const {
  getProjectById,
  getDirectoryById,
  getFileById,
} = require("./databaseOperations");
const { getFileOrFolderPath } = require("./apiClient");

module.exports.createEmptyProject = asyncHandler(async (projectId) => {
  await fs.ensureDir(ClientProjectPath(projectId));
  return;
});

async function copyProjectfromDatabase(projectId) {
  const dirPath = ClientProjectPath(projectId);
  if (await fs.pathExists(dirPath)) {
    return false;
  }

  const project = await getProjectById(projectId);
  if (!project) {
    return false;
  }

  await copyDirectoryFromDatabase(dirPath, project.rootDirectory);

  const entryfile = await getEntryFile(dirPath);
  if (entryfile) {
    await modifyAppFile(path.join(dirPath, entryfile));
  }
  return true;
}

module.exports.copyProjectfromDatabase = copyProjectfromDatabase;

async function copyDirectoryFromDatabase(dirPath, dirId) {
  await fs.ensureDir(dirPath);
  const directory = await getDirectoryById(dirId);

  // copying sub-directories
  if (directory.subDirectory && directory.subDirectory.length > 0) {
    for (let dir of directory.subDirectory) {
      const dir_ = await getDirectoryById(dir);
      if (dir_.name === "node_modules") {
        continue;
      }
      await copyDirectoryFromDatabase(path.join(dirPath, dir_.name), dir_._id);
    }
  }

  // copying files
  const files = directory.files;
  if (files && files.length > 0) {
    for (let file of files) {
      const file_ = await getFileById(file);
      if (file_.contentType === "Binary") {
        await downloadImageFromCloudinary(
          file_.url,
          path.join(dirPath, file_.name)
        );
      } else {
        await fs.writeFile(path.join(dirPath, file_.name), file_.content);
      }
    }
  }
}

module.exports.deleteProject = asyncHandler(async (projectId) => {
  const projectPath = ClientProjectBaseDirPath(projectId);

  const chmodRecursive = async (dir, mode) => {
    const items = await fs.readdir(dir);
    await Promise.all(
      items.map(async (item) => {
        const itemPath = path.join(dir, item);
        const stats = await fs.lstat(itemPath);
        if (stats.isDirectory()) {
          await chmodRecursive(itemPath, mode);
        }
        await fs.chmod(itemPath, mode);
      })
    );
    await fs.chmod(dir, mode);
  };

  await chmodRecursive(projectPath, 0o777)
  await fs.remove(projectPath);

  return true;
});

module.exports.manageOnLocal = asyncHandler(
  async (id, isFile, task, nameOrContent = null) => {
    var doc;
    if(isFile) doc = await getFileById(id);
    else doc = await getDirectoryById(id);

    var filefolderpath = formatClientFileFolderPath(doc.path, doc.project)
    if (!filefolderpath) {
      return null;
    }
    // creating new file or folder
    if (task === "create") {
      if (isFile) {
        const file = await getFileById(id);
        if (file.contentType === "Binary") {
          await downloadImageFromCloudinary(file.url, filefolderpath);
          return;
        }
        await fs.writeFile(filefolderpath, nameOrContent || "");
      } else {
        await fs.ensureDir(filefolderpath);
      }
    }

    // rename file or folder
    else if (task === "editname") {
      if (!nameOrContent) {
        throw new Error(
          "You have forgot to provide name for renaming the file or folder"
        );
      }
      var newPath = path.join(filefolderpath, "../", nameOrContent);
      await fs.rename(filefolderpath, newPath);
    }

    // delete file or folder
    else if (task === "delete") {
      await fs.remove(filefolderpath);
    }

    // updating content of file
    else if (task === "write") {
      if (!isFile) {
        throw new Error("Write operation can only be performed in a file");
      }
      await fs.writeFile(filefolderpath, nameOrContent);
      if (await checkForEntryFile(filefolderpath)) {
        await modifyAppFile(filefolderpath);
      }
    } else {
      throw new Error(`Invalid Task - ${task}`);
    }

    return true;
  }
);


