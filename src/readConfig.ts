import {defaultsDeep} from "lodash-es";
import { promises as fs } from 'fs';
import { load as loadYaml } from "js-yaml";

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
const readConfig = async () => {
  const rawConfig = loadYaml(
    await fs.readFile("generator-config.yml", "utf8")
  );

  return defaultsDeep(rawConfig, defaults);
};

export default readConfig;
