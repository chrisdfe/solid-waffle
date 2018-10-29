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

// Builds a filedata object for a file. Doesn't check for layout etc
const buildFile = filename => {
  return Promise.try(() => frontMatter.extractFromFile(filename)).then(
    ({ content, context: localContext }) => {
      const children = [];

      const context = {
        ...readConfig().globalContext,
        ...localContext,
        ...templateHelpers,
        children
      };

      return { filename, content, context };
    }
  );
};

// Makes the currentFileData a 'child' of the layout it inherits from.
const inheritLayout = (layoutFilename, currentFileData) => {
  const layoutPath = path.join(readConfig().layoutsDir, layoutFilename);

  return buildFile(layoutPath).then(layoutFileData => {
    const inheritedFileData = _.cloneDeep(layoutFileData);

    // Inherit context from layout
    Object.assign(
      inheritedFileData.context,
      _.cloneDeep(currentFileData.context)
    );

    // Push children into layout context
    inheritedFileData.context.children.push(currentFileData);

    // Retain current filename
    inheritedFileData.filename = currentFileData.filename;

    return inheritedFileData;
  });
};

// TODO - better name for this.
const buildFileFull = filename => {
  return Promise.try(() => buildFile(filename)).then(fileData => {
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
const buildFilesInDirectory = directory =>
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

        return buildFilesInDirectory(filename);
      }

      return buildFileFull(filename);
    });

const buildFromSourceDir = () =>
  Promise.try(() =>
    buildFilesInDirectory(readConfig().sourceDir, readConfig().globalContext)
  );

module.exports = {
  buildFromSourceDir
};
