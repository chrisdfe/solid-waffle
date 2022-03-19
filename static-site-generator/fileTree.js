const fs = require("fs-extra");
const path = require("path");
const _ = require("lodash");

const frontMatter = require("./frontMatter");
const readConfig = require("./readConfig");
const templateHelpers = require("./templateHelpers");

const getDirectoryNameFromFullPath = path =>
  path
    .split("/")
    .slice(-1)
    .join("/");

// Builds a fileData object for a file. Doesn't check for layout etc
const buildFileData = async filename => {
  const { content, context: localContext } = await frontMatter.extractFromFile(filename)

  const context = {
    ...readConfig().globalContext,
    ...localContext,
    ...templateHelpers
  };

  return { filename, content, context };
};

// Makes the currentFileData the body of the layout it inherits from.
const inheritLayout = async (layoutFilename, currentFileData) => {
  const layoutPath = path.join(readConfig().layoutsDir, layoutFilename);

  const layoutFileData = await buildFileData(layoutPath)
  const inheritedFileData = _.cloneDeep(layoutFileData);

  // Inherit context from layout
  Object.assign(
    inheritedFileData.context,
    _.cloneDeep(currentFileData.context)
  );

  // Set the body field
  inheritedFileData.context.body = currentFileData;

  // Retain current filename (otherwise it will use the layout template's filename)
  inheritedFileData.filename = currentFileData.filename;

  return inheritedFileData;
};

// TODO - better name for this.
const buildFileDataFull = async filename => {
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
const buildFileTreeFromDirectory = async directory => {
  const directories = fs.readdirSync(directory)
  const fullDirectories = directories.map(filename => path.join(directory, filename))

  return Promise.all(
    fullDirectories.map(filename => {
      const stats = fs.lstatSync(filename);

      if (stats.isDirectory()) {
        if (
          getDirectoryNameFromFullPath(filename).startsWith("_") ||
          filename === readConfig().layoutsDir
        ) {
          return [];
        }

        return buildFileTreeFromDirectory(filename);
      }

      return buildFileDataFull(filename);
    })
  )
}

const buildFromSourceDir = () => {
  return buildFileTreeFromDirectory(
    readConfig().sourceDir,
    readConfig().globalContext
  )
}

module.exports = {
  buildFromSourceDir
};
