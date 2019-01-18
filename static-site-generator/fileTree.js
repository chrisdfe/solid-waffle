const Promise = require("bluebird");
const fs = require("fs-extra");
const path = require("path");
const _ = require("lodash");

const frontMatter = require("./frontMatter");
const fsUtils = require("./fsUtils");
const readConfig = require("./readConfig");
const templateHelpers = require("./templateHelpers");

const getDirectoryNameFromFullPath = path =>
  path
    .split("/")
    .slice(-1)
    .join("/");

// Builds a fileData object for a file. Doesn't check for layout etc
const buildFileData = filename => {
  return Promise.try(() => frontMatter.extractFromFile(filename)).then(
    ({ content, context: localContext }) => {
      const context = {
        ...readConfig().globalContext,
        ...localContext,
        ...templateHelpers
      };

      return { filename, content, context };
    }
  );
};

// Makes the currentFileData the body of the layout it inherits from.
const inheritLayout = (layoutFilename, currentFileData) => {
  const layoutPath = path.join(readConfig().layoutsDir, layoutFilename);

  return buildFileData(layoutPath).then(layoutFileData => {
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
  });
};

// TODO - better name for this.
const buildFileDataFull = filename => {
  return Promise.try(() => buildFileData(filename)).then(fileData => {
    const { layout } = fileData.context;

    if (layout) {
      return inheritLayout(layout, fileData);
    }

    return fileData;
  });
};

// TODO
// a) inherit context
// b) have a directory blacklist to prevent expanding layouts, partials etc
const buildFileTreeFromDirectory = directory =>
  Promise.try(() => fs.readdirSync(directory))
    .map(filename => path.join(directory, filename))
    .map(filename => {
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
    });

const buildFromSourceDir = () =>
  Promise.try(() =>
    buildFileTreeFromDirectory(
      readConfig().sourceDir,
      readConfig().globalContext
    )
  );

module.exports = {
  buildFromSourceDir
};
