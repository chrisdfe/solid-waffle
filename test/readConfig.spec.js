const chai = require("chai");
const mock = require("mock-fs");
const yaml = require("js-yaml");

const readConfig = require("../src/readConfig");

const expect = chai.expect;

const createMockConfig = (config = {}) => {
  mock({
    "generator-config.yml": yaml.safeDump(config)
  });
};

describe("readConfig", () => {
  it("exists", () => {
    expect(readConfig).to.exist.and.be.a("function");
  });

  it("reads the configuration correctly", () => {
    createMockConfig({
      sourceDir: "testSourceDirectory",
      destDir: "testDestionationDirectory"
    });

    const config = readConfig();

    expect(config)
      .to.be.an("object")
      .that.includes.all.keys(["sourceDir", "destDir"]);

    expect(config.sourceDir).to.equal("testSourceDirectory");
    expect(config.destDir).to.equal("testDestionationDirectory");
  });

  it("adds default configuration", () => {
    createMockConfig();

    const config = readConfig();

    expect(config)
      .to.be.an("object")
      .that.includes.all.keys([
        "sourceDir",
        "destDir",
        "layoutsDir",
        "globalContext"
      ]);
  });

  xdescribe("caching");
  xdescribe("globalContext");
});
