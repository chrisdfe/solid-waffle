const _ = require("lodash");
const fs = require("fs");
const yaml = require("js-yaml");
const Promise = require("bluebird");

const configDefaults = {
  sourceDir: "src",
  destDir: "dist",
  layoutDir: "src/layouts",
  globalContext: {
    layout: false
  }
};

// TODO - make sure filepath is relative to root
const readConfig = () =>
  Promise.try(() =>
    yaml.safeLoad(fs.readFileSync("generator-config.yml", "utf8"))
  ).then(data => _.defaultsDeep(data, configDefaults));

module.exports = readConfig;
