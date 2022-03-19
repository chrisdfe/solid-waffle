const chai = require("chai");
const mock = require("mock-fs");
const yaml = require("js-yaml");
const fs = require("fs-extra");
const path = require("path");

const { createMockTemplateContents } = require("./utils");
const generate = require("../src/generate");

const expect = chai.expect;

describe("generate", () => {
  const createMockConfig = (config = {}) => ({
    sourceDir: "testSourceDirectory",
    destDir: "testDestionationDirectory",
    layoutsDir: "testSourceDirectory/testLayoutsDirectory",
    ...config
  });

  it("exists", () => {
    expect(generate).to.be.a("function");
  });

  it("outputs to dist/", () => {
    const mockConfig = createMockConfig();

    mock({
      "generator-config.yml": yaml.safeDump(mockConfig),
      [mockConfig.sourceDir]: {
        "index.html": "",
        "404.html": ""
      }
    });

    return generate().then(() => {
      const distFiles = fs.readdirSync(mockConfig.destDir);
      expect(distFiles)
        .to.be.an("array")
        .that.includes("index.html");
    });
  });

  it("renders ejs correctly", () => {
    const mockConfig = createMockConfig();

    const indexFileTemplate = createMockTemplateContents({
      frontMatter: { title: "Index Title" },
      content: "<h1><%= title %></h1>"
    });

    mock({
      "generator-config.yml": yaml.safeDump(mockConfig),
      [mockConfig.sourceDir]: {
        "index.html": indexFileTemplate
      }
    });

    return generate().then(() => {
      const distFiles = fs.readdirSync(mockConfig.destDir);

      const outputContents = fs
        .readFileSync(path.join(mockConfig.destDir, distFiles[0]))
        .toString();

      expect(outputContents)
        .to.be.a("string")
        .that.includes("Index Title");
    });
  });

  it('renders markdown for files with a "md" filename extension', () => {
    const mockConfig = createMockConfig();

    const indexFileTemplate = createMockTemplateContents({
      frontMatter: { title: "Index Title" },
      // prettier-ignore
      content: [
        "# <%= title %>",
        "This is a markdown file.",
      ].join("\n")
    });

    mock({
      "generator-config.yml": yaml.safeDump(mockConfig),
      [mockConfig.sourceDir]: {
        "index.md": indexFileTemplate
      }
    });

    return generate().then(() => {
      const distFiles = fs.readdirSync(mockConfig.destDir);

      const outputContents = fs
        .readFileSync(path.join(mockConfig.destDir, distFiles[0]))
        .toString();

      expect(outputContents)
        .to.be.a("string")
        .that.includes(`Index Title`)
        .and.includes("<p>This is a markdown file.</p>");
    });
  });

  it("handles nested directories correclty", () => {
    const mockConfig = createMockConfig();

    mock({
      "generator-config.yml": yaml.safeDump(mockConfig),
      [mockConfig.sourceDir]: {
        "index.html": "",
        posts: {
          post1: ""
        }
      }
    });

    return generate().then(() => {
      const distFiles = fs.readdirSync(mockConfig.destDir);

      expect(distFiles)
        .to.be.an("array")
        .that.includes("posts");

      const posts = fs.readdirSync(path.join(mockConfig.destDir, distFiles[1]));

      expect(posts)
        .to.be.an("array")
        .that.includes("post1");
    });
  });

  it("doesn't build directories prefixed with a '_'", () => {
    const mockConfig = createMockConfig();

    mock({
      "generator-config.yml": yaml.safeDump(mockConfig),
      [mockConfig.sourceDir]: {
        "index.html": "",
        _ignoreThisDirectory: {
          ignoredFile: ""
        }
      },
      [mockConfig.layoutsDir]: {
        "default.html": ""
      }
    });

    return generate().then(() => {
      const distFiles = fs.readdirSync(mockConfig.destDir);

      expect(distFiles).and.to.not.include("_ignoreThisDirectory");
    });
  });

  it("doesn't build files in the layout directory", () => {
    const mockConfig = createMockConfig();

    mock({
      "generator-config.yml": yaml.safeDump(mockConfig),
      [mockConfig.sourceDir]: {
        "index.html": ""
      },
      [mockConfig.layoutsDir]: {
        "default.html": ""
      }
    });

    return generate().then(() => {
      const distFiles = fs.readdirSync(mockConfig.destDir);

      expect(distFiles).and.to.not.include("testLayoutsDirectory");
    });
  });

  it("renders template body correctly", () => {
    const mockConfig = createMockConfig();

    mock({
      "generator-config.yml": yaml.safeDump(mockConfig),
      [mockConfig.sourceDir]: {
        "index.html": createMockTemplateContents({
          frontMatter: {
            layout: "default.html"
          },
          content:
            "<h2>I would like to be rendered inside of the default layout please</h2>"
        })
      },
      [mockConfig.layoutsDir]: {
        "default.html": "<div><h2>Layout Title</h2><%- body %></div>"
      }
    });

    return generate().then(() => {
      const distFiles = fs.readdirSync(mockConfig.destDir);

      const indexFileContents = fs
        .readFileSync(path.join(mockConfig.destDir, distFiles[0]))
        .toString();

      expect(indexFileContents)
        .to.include("Layout Title")
        .and.include(
          "I would like to be rendered inside of the default layout please"
        );
    });
  });
});
