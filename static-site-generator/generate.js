const fs = require("fs-extra");
const path = require("path");
const Promise = require("bluebird");
const yaml = require("js-yaml");

const fileTree = require("./fileTree");
const fsUtils = require("./fsUtils");

const readConfig = require("./readConfig");
const compileTemplate = require("./compileTemplate");

const removeDestFolder = () =>
  Promise.try(() => fs.removeSync(readConfig().destDir));

const getParentDirectory = filename =>
  filename
    .split("/")
    .slice(0, -1)
    .join("/");

const writeFiledataToFilesystem = (fileData, inheritedContext) => {
  let { filename, context, content } = fileData;

  return Promise.try(() => {
    // render context children first
    // TODO - beware circular 'children' references
    if (context.children.length > 0) {
      return Promise.try(() => context.children)
        .map(child => {
          return compileTemplate(child.content, child.context);
        })
        .then(renderedChildren => renderedChildren.join("\n"))
        .then(renderedChildren => {
          context.children = renderedChildren;
        });
    }

    return null;
  }).then(() => {
    return compileTemplate(content, context).then(compiled => {
      const destPath = fsUtils.sourcePathToDestPath(filename);
      const parentDirectory = getParentDirectory(destPath);

      fs.mkdirpSync(parentDirectory);
      fs.writeFileSync(destPath, compiled);
    });
  });
};

const writeFileTreeToFilesystem = fileTree =>
  Promise.try(() => fileTree).map(fileData => {
    if (Array.isArray(fileData)) {
      return writeFileTreeToFilesystem(fileData);
    } else {
      return writeFiledataToFilesystem(fileData);
    }
  });

// TODO - copy/compile asset directory into dist/
const generateSite = () =>
  Promise.try(() => removeDestFolder())
    .then(() => fileTree.buildFromSourceDir())
    .then(fileTree => writeFileTreeToFilesystem(fileTree));

module.exports = generateSite;
