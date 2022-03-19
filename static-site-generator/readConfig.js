const _ = require("lodash");
const fs = require("fs-extra");
const yaml = require("js-yaml");

const defaults = {
  sourceDir: "src",
  destDir: "dist",
  layoutsDir: "src/layouts",
  globalContext: {
    layout: false
  }
};

// TODO
// 1) make sure filepath is relative to root
// 2) cache config in a way that doesn't break tests
// 3) configurable config file name
const readConfig = () => {
  const rawConfig = yaml.safeLoad(
    fs.readFileSync("generator-config.yml", "utf8")
  );
  return _.defaultsDeep(rawConfig, defaults);
};

module.exports = readConfig;
