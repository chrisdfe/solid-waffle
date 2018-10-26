const fs = require("fs-extra");
const path = require("path");
const Promise = require("bluebird");
const yaml = require("js-yaml");

const readConfig = require("./readConfig");
const compileTemplate = require("./compileTemplate");
const templateHelpers = require("./templateHelpers");
const frontMatter = require("./frontMatter");

let config;
let directoryBlacklist = [];

// TODO - clearer differentiation between this and compileTemplate
const renderTemplate = (templateStr, context) => {
  const fullContext = {
    ...config.globalContext,
    ...context,
    ...templateHelpers
  };

  // TODO
  // this should be the other way around - variables defined in the layout context
  // should flow down to the child template. As it none of the context from the layout template
  // is available in the child templates
  return compileTemplate(templateStr, fullContext).then(compiled => {
    if (context.layout) {
      const layoutFilename = path.join(config.layoutDir, context.layout);
      return loadFileContents(layoutFilename).then(layoutTemplateStr =>
        compileTemplate(layoutTemplateStr, {
          ...fullContext,
          content: compiled
        })
      );
    }

    return compiled;
  });
};

//
// File system
//

const removeDestFolder = () => Promise.try(() => fs.removeSync(config.destDir));

const sourcePathToDestPath = srcPath =>
  [config.destDir, ...srcPath.split("/").slice(1)].join("/");

const getParentDirectory = filename =>
  filename
    .split("/")
    .slice(0, -1)
    .join("/");

const loadFileContents = filename =>
  Promise.try(() => fs.readFileSync(filename)).then(contents =>
    contents.toString()
  );

const buildFile = (filename, inheritedContext) => {
  let context, content;

  return Promise.try(() => loadFileContents(filename))
    .then(contents => frontMatter.extract(contents, inheritedContext))
    .then(fileData => {
      context = fileData.context;
      content = fileData.content;

      return renderTemplate(content, context);
    })
    .then(compiled => ({ compiled, context, filename }));
};

// Saves the configuration from generator-config.yml to the local variable 'config'
const setConfig = () =>
  readConfig().then(contents => {
    config = contents;
    directoryBlacklist.push(config.layoutDir);
    return config;
  });

//
// Filetree
//

// TODO
// a) inherit context
// b) have a directory blacklist to prevent expanding layouts, partials etc
const buildFilesInDirectory = directory =>
  Promise.try(() => fs.readdirSync(directory))
    .map(filename => path.join(directory, filename))
    .map(filename => {
      const stats = fs.lstatSync(filename);

      if (stats.isDirectory()) {
        if (directoryBlacklist.includes(filename)) {
          return [];
        }

        return buildFilesInDirectory(filename);
      }

      return buildFile(filename);
    });

const buildFileTree = () =>
  Promise.try(() =>
    buildFilesInDirectory(config.sourceDir, config.globalContext)
  );

const writeFiledataToFilesystem = (fileData, inheritedContext) => {
  const { compiled, context, filename } = fileData;

  const destPath = sourcePathToDestPath(filename);
  const parentDirectory = getParentDirectory(destPath);

  fs.mkdirSync(parentDirectory);
  fs.writeFileSync(destPath, compiled);
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
const buildSite = () =>
  Promise.try(() => setConfig())
    .then(() => removeDestFolder())
    .then(() => buildFileTree())
    .then(fileTree => writeFileTreeToFilesystem(fileTree));

module.exports = buildSite;
