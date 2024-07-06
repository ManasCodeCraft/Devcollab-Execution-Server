const axios = require("axios");
const fs = require("fs");
const tar = require("tar");
const path = require("path");
const mkdirp = require("mkdirp");
const semver = require("semver");

const packageCache = {};

global.asyncHandler = fn => async (...args) => {
  try {
    return await fn(...args);
  } catch (error) {
    throw error; 
  }
};

// Utility function to fetch package metadata
async function fetchPackageMetadata(packageName) {
  if (packageCache[packageName]) {
    return packageCache[packageName];
  }

  const url = `https://registry.npmjs.org/${packageName}`;
  try {
    const response = await axios.get(url);
    packageCache[packageName] = response.data;
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error(`Package ${packageName} not found`);
    } else {
      throw error;
    }
  }
}

// Utility function to resolve a version based on a range
function resolveVersion(metadata, versionRange) {
  if (versionRange === "latest") {
    return metadata["dist-tags"].latest;
  } else {
    const versions = Object.keys(metadata.versions);
    const maxSatisfying = semver.maxSatisfying(versions, versionRange);
    if (maxSatisfying) {
      return maxSatisfying;
    } else {
      throw new Error(`No matching version found for ${versionRange}`);
    }
  }
}

// Utility function to download and extract tarball
async function downloadAndExtractTarball(tarballUrl, extractPath) {
  try {
    const tarballResponse = await axios({
      url: tarballUrl,
      method: "GET",
      responseType: "stream",
    });

    const tarballPath = path.join(__dirname, `${path.basename(tarballUrl)}`);
    const writer = fs.createWriteStream(tarballPath);
    tarballResponse.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    mkdirp.sync(extractPath);

    await tar.extract({
      file: tarballPath,
      cwd: extractPath,
      strip: 1,
    });

    fs.unlinkSync(tarballPath);
  } catch (error) {
    throw new Error(`Failed to download or extract tarball: ${error.message}`);
  }
}

// Main function to simulate package installation
async function npmInstall(packageName, versionRange = "latest", baseDir = "node_modules") {
  const packageDir = path.join(baseDir, packageName);

  if (fs.existsSync(packageDir)) {
    console.log(`${packageName}@${versionRange} already installed, skipping...`);
    return;
  }

  try {
    const metadata = await fetchPackageMetadata(packageName);
    const resolvedVersion = resolveVersion(metadata, versionRange);
    const versionMetadata = metadata.versions[resolvedVersion];

    if (!fs.existsSync(packageDir)) {
      fs.mkdirSync(packageDir, { recursive: true });
    }

    const tarballUrl = versionMetadata.dist.tarball;
    await downloadAndExtractTarball(tarballUrl, packageDir);

    console.log(`Installed ${packageName}@${resolvedVersion}`);

    if (versionMetadata.dependencies) {
      await Promise.all(
        Object.entries(versionMetadata.dependencies).map(
          ([depName, depVersion]) => {
            return npmInstall(depName, depVersion, baseDir);
          }
        )
      );
    }
  } catch (error) {
    console.error(`Error installing ${packageName}@${versionRange}:`, error.message);
  }
}


module.exports.installNodejsPackageArray = asyncHandler(async (arrayOfPackages, nodeModulesPath) => {
  await Promise.all(
    arrayOfPackages.map(async (pkg) => {
      if (typeof pkg !== "string" && typeof pkg !== "object") {
        throw new Error("Invalid package format. Please provide a string or an object with packageName and versionRange properties.");
      }

      let newPackage;
      if (typeof pkg === "string") {
        if (pkg.indexOf("@") === -1) {
          newPackage = { packageName: pkg, versionRange: "latest" };
        } else {
          const [packageName, versionRange] = pkg.split("@");
          newPackage = { packageName, versionRange };
        }
      } else {
        newPackage = pkg;
      }

      return npmInstall(newPackage.packageName, newPackage.versionRange, nodeModulesPath);
    })
  );
});

module.exports.installBuiltInNodejsPackages = asyncHandler(async (nodeModulesPath) => {
  const builtIns = [...require("module").builtinModules];
  const packages = builtIns.map((pkg) => ({ packageName: pkg, versionRange: "latest" }));

  await module.exports.installNodejsPackageArray(packages, nodeModulesPath);
});

