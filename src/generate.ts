import {promises as fs} from 'fs';
import { render as renderEJS } from "ejs";
const marked = require("marked");

const fileTree = require("./fileTree");
const fsUtils = require("./fsUtils");

const readConfig = require("./readConfig");

const removeDestFolder = async () => {
  fs.rmdir(readConfig().destDir)
}

const getParentDirectory = (filename: string) =>
  filename
    .split("/")
    .slice(0, -1)
    .join("/");

const getFilenameExtension = (filename: string) => {
  const pieces = filename.split(".");
  return pieces[pieces.length - 1];
};

// @ts-ignore
const renderTemplate = async (filename, template, context) => {
  const output = await renderEJS(template, context)
  
  if (getFilenameExtension(filename) === "md") {
    return marked(output);
  }
  
  return output;
}

// @ts-ignore
const writeFiledataToFilesystem = async (fileData) => {
  let { filename, context, content } = fileData;
  
  // render context body first
  if (context.body) {
    const renderedBody = await renderTemplate(filename, context.body.content, context.body.context)
    context.body = renderedBody;
  }
  
  const compiled = await renderTemplate(filename, content, context)
  const destPath = fsUtils.sourcePathToDestPath(filename);
  const parentDirectory = getParentDirectory(destPath);
  
  await fs.mkdir(parentDirectory, { recursive: true });
  await fs.writeFile(destPath, compiled);
};

// @ts-ignore
const writeFileTreeToFilesystem = async fileTree =>
// @ts-ignore
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

export default generateSite;
