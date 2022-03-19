import { promises as fs } from 'fs'
import * as path from "path";

import cloneDeep from 'lodash-es/cloneDeep';

import * as frontMatter from "./frontMatter";
import readConfig from "./readConfig";
// import templateHelpers from "./templateHelpers";

import type { FileData, FileDataTree } from './types';

const getDirectoryNameFromFullPath = (path: string) =>
  path
    .split("/")
    .slice(-1)
    .join("/");

// Builds a fileData object for a file. Doesn't check for layout etc
const buildFileData = async (filename: string): Promise<FileData> => {
  const { content, context: localContext } = await frontMatter.extractFromFile(filename)

  const context = {
    ...(await readConfig()).globalContext,
    ...localContext,
    // ...templateHelpers
  };

  return { filename, content, context };
};

// Makes the currentFileData the body of the layout it inherits from.
const inheritLayout = async (layoutFilename: string, currentFileData: FileData): Promise<FileData> => {
  const config = await readConfig();
  const layoutPath = path.join(config.layoutsDir, layoutFilename);

  const layoutFileData = await buildFileData(layoutPath)
  const inheritedFileData = cloneDeep(layoutFileData);

  // Inherit context from layout
  Object.assign(
    inheritedFileData.context,
    cloneDeep(currentFileData.context)
  );

  // Set the body field
  inheritedFileData.context.body = currentFileData;

  // Retain current filename (otherwise it will use the layout template's filename)
  inheritedFileData.filename = currentFileData.filename;

  return inheritedFileData;
};

// TODO - better name for this.
const buildFileDataFull = async (filename: string) => {
  const fileData = await buildFileData(filename);
  const { layout } = fileData.context;

  if (layout) {
    return inheritLayout(layout, fileData);
  }

  return fileData;
};

// TODO
// a) inherit context
// b) have a directory blacklist to prevent expanding layouts, partials etc
// const buildFileTreeFromDirectory = async (directory: string, inheritedContext) => {
const buildFileTreeFromDirectory = async (directory: string): Promise<FileDataTree> => {
  const config = await readConfig();
  const directories = await fs.readdir(directory)
  const fullDirectories = directories.map(filename => path.join(directory, filename))

  return Promise.all(
    fullDirectories.map(async filename => {
      const stats = await fs.lstat(filename);

      if (stats.isDirectory()) {
        if (
          getDirectoryNameFromFullPath(filename).startsWith("_") ||
          filename === config.layoutsDir
        ) {
          return [];
        }

        return buildFileTreeFromDirectory(filename);
      }

      return buildFileDataFull(filename);
    })
  )
}

const buildFromSourceDir = async () => {
  const config = await readConfig();

  return buildFileTreeFromDirectory(
    config.sourceDir,
    // config.globalContext
  )
}

module.exports = {
  buildFromSourceDir
};
