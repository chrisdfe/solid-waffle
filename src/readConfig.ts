import { defaultsDeep } from "lodash-es";
import { promises as fs } from 'fs';
import { load as loadYaml } from "js-yaml";

import { type Config } from './types';

const defaults: Config = {
  sourceDir: "src",
  destDir: "dist",
  layoutsDir: "src/layouts",
  globalContext: {
    layout: ""
  }
};

// TODO
// 1) make sure filepath is relative to root
// 2) cache config in a way that doesn't break tests
// 3) configurable config file name
const readConfig = async (): Promise<Config> => {
  const rawContents = await fs.readFile("generator-config.yml", "utf8")
  const rawConfig = loadYaml(rawContents) as Config;

  return defaultsDeep(rawConfig, defaults);
};

export default readConfig;
