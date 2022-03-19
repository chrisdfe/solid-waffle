import { promises as fs } from 'fs';

const readConfig = require("./readConfig");

export const sourcePathToDestPath = (srcPath: string) =>
  [readConfig().destDir, ...srcPath.split("/").slice(1)].join("/");

export const loadFileContents = async (filename: string) => {
  const contents = await fs.readFile(filename)
  return contents.toString();
}

