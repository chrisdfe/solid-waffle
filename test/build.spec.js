const chai = require("chai");
const mock = require("mock-fs");
const yaml = require("js-yaml");

const build = require("../static-site-generator/build");

const expect = chai.expect;

beforeEach(() => {
  const configuration = {
    sourceDir: "testSourceDirectory",
    destDir: "testDestionationDirectory"
  };

  mock({
    "generator-config.yml": yaml.safeDump(configuration),
    [configuration.sourceDir]: { "index.html": "" }
  });
});

describe("build", () => {
  it("works", () => {
    build();
  });
});
