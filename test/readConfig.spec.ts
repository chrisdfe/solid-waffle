import { expect } from "chai";
import * as yaml from "js-yaml";

import readConfig from "../src/readConfig";

import { mockFs } from './utils';

const createMockConfig = (config = {}) => {
  mockFs({
    "generator-config.yml": yaml.dump(config)
  });
};

describe("readConfig", () => {
  it("exists", () => {
    expect(readConfig).to.exist.and.be.a("function");
  });

  it("reads the configuration correctly", async () => {
    createMockConfig({
      sourceDir: "testSourceDirectory",
      destDir: "testDestionationDirectory"
    });

    const config = await readConfig();

    expect(config)
      .to.be.an("object")
      .that.includes.all.keys(["sourceDir", "destDir"]);

    expect(config.sourceDir).to.equal("testSourceDirectory");
    expect(config.destDir).to.equal("testDestionationDirectory");
  });

  it("adds default configuration", async () => {
    createMockConfig();

    const config = await readConfig();

    expect(config)
      .to.be.an("object")
      .that.includes.all.keys([
        "sourceDir",
        "destDir",
        "layoutsDir",
        "globalContext"
      ]);
  });

  xdescribe("caching", () => { });
  xdescribe("globalContext", () => { });
});
