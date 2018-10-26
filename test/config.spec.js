const chai = require("chai");
const mock = require("mock-fs");
const yaml = require("js-yaml");

const readConfig = require("../static-site-generator/readConfig");

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

  it("reads the content correctly", () => {
    createMockConfig({
      sourceDir: "testSourceDirectory",
      destDir: "testDestionationDirectory"
    });

    return readConfig().then(config => {
      expect(config)
        .to.be.an("object")
        .that.includes.all.keys(["sourceDir", "destDir"]);

      expect(config.sourceDir).to.equal("testSourceDirectory");
      expect(config.destDir).to.equal("testDestionationDirectory");
    });
  });

  it("adds default configuration", () => {
    createMockConfig({
      sourceDir: "testSourceDirectory",
      destDir: "testDestionationDirectory"
    });

    return readConfig().then(config => {
      expect(config)
        .to.be.an("object")
        .that.includes.all.keys([
          "sourceDir",
          "destDir",
          "layoutDir",
          "globalContext"
        ]);
    });
  });

  xdescribe("globalContext");
});
