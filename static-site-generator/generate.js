const fs = require("fs-extra");
const ejs = require("ejs");
const marked = require("marked");

const fileTree = require("./fileTree");
const fsUtils = require("./fsUtils");

const readConfig = require("./readConfig");

const removeDestFolder = async () => {
  fs.removeSync(readConfig().destDir)
}

const getParentDirectory = filename =>
  filename
    .split("/")
    .slice(0, -1)
    .join("/");

const getFilenameExtension = filename => {
  const pieces = filename.split(".");
  return pieces[pieces.length - 1];
};

const renderTemplate = async (filename, template, context) => {
  const output = await ejs.render(template, context)

  if (getFilenameExtension(filename) === "md") {
    return marked(output);
  }

  return output;
}

const writeFiledataToFilesystem = async (fileData, inheritedContext) => {
  let { filename, context, content } = fileData;

  // render context body first
  if (context.body) {
    const renderedBody = await renderTemplate(filename, context.body.content, context.body.context)
    context.body = renderedBody;
  }

  const compiled = await renderTemplate(filename, content, context)
  const destPath = fsUtils.sourcePathToDestPath(filename);
  const parentDirectory = getParentDirectory(destPath);

  fs.mkdirpSync(parentDirectory);
  fs.writeFileSync(destPath, compiled);
};

const writeFileTreeToFilesystem = async fileTree =>
  Promise.all(fileTree.map(fileData => {
    if (Array.isArray(fileData)) {
      return writeFileTreeToFilesystem(fileData);
    } else {
      return writeFiledataToFilesystem(fileData);
    }
  }))

const generateSite = async () => {
  await removeDestFolder()
  const newFileTree = await fileTree.buildFromSourceDir()
  await writeFileTreeToFilesystem(newFileTree);
}

module.exports = generateSite;
