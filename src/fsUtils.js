const fs = require("fs-extra");

const readConfig = require("./readConfig");

const sourcePathToDestPath = srcPath =>
  [readConfig().destDir, ...srcPath.split("/").slice(1)].join("/");

const loadFileContents = filename => {
  const contents = fs.readFileSync(filename)
  return contents.toString();
}

module.exports = {
  sourcePathToDestPath,
  loadFileContents
};
