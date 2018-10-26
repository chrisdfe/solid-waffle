const Promise = require("bluebird");
const fs = require("fs-extra");

const readConfig = require("./readConfig");

const sourcePathToDestPath = srcPath =>
  [readConfig().destDir, ...srcPath.split("/").slice(1)].join("/");

const loadFileContents = filename =>
  Promise.try(() => fs.readFileSync(filename)).then(contents =>
    contents.toString()
  );

module.exports = {
  sourcePathToDestPath,
  loadFileContents
};
