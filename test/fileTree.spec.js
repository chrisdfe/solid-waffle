const chai = require("chai");
const mock = require("mock-fs");
const yaml = require("js-yaml");

const { createMockTemplateContents } = require("./utils");
const fileTree = require("../static-site-generator/fileTree");

const expect = chai.expect;

describe("fileTree", () => {
  const createMockFileContents = (context = {}) =>
    createMockTemplateContents({
      frontMatter: { title: "Test Title", ...context },
      content: "<h1><%= title %></h1>"
    });

  const createMockConfig = (config = {}) => ({
    sourceDir: "testSourceDirectory",
    destDir: "testDestionationDirectory",
    layoutsDir: "testSourceDirectory/testLayoutsDirectory",
    ...config
  });

  it("exists", () => {
    expect(fileTree)
      .to.exist.and.be.an("object")
      .that.has.all.keys(["buildFromSourceDir"]);
  });

  it("generates a fileData tree", () => {
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

    return fileTree.buildFromSourceDir().then(tree => {
      expect(tree).to.be.an("array");
      expect(tree[0]).to.be.an("object");
      expect(tree[1]).to.be.an("array");
    });
  });

  it("generates fileData with the correct shape", () => {
    const mockConfig = createMockConfig();

    mock({
      "generator-config.yml": yaml.safeDump(mockConfig),
      [mockConfig.sourceDir]: {
        "index.html": ""
      }
    });

    return fileTree.buildFromSourceDir().then(tree => {
      expect(tree[0])
        .to.be.an("object")
        .that.has.all.keys(["filename", "content", "context"]);
    });
  });

  describe("layout", () => {
    let mockConfig;

    const mockLayoutFilesystem = () => {
      mockConfig = createMockConfig();

      mock({
        "generator-config.yml": yaml.safeDump(mockConfig),
        [mockConfig.sourceDir]: {
          "index.html": createMockTemplateContents({
            frontMatter: {
              layout: "default.html",
              indexContextField: 2
            },
            content:
              "<h2>I want to be rendered inside of the default layout</h2>"
          })
        },
        [mockConfig.layoutsDir]: {
          "default.html": createMockTemplateContents({
            frontMatter: {
              layoutContextField: 1
            },
            content: "<body><h2>Layout Title</h2><%- content %></body>"
          })
        }
      });
    };

    it("nests the children field correctly", () => {
      mockLayoutFilesystem();

      return fileTree.buildFromSourceDir().then(tree => {
        expect(tree[0].content)
          .to.be.a("string")
          .that.includes("Layout Title");

        expect(tree[0].context.children)
          .to.be.an("array")
          .with.lengthOf(1);

        expect(tree[0].context.children[0].content)
          .to.be.a("string")
          .that.includes("I want to be rendered inside of the default layout");
      });
    });

    it("retains the original filename", () => {
      mockLayoutFilesystem();

      return fileTree.buildFromSourceDir().then(tree => {
        const indexFile = tree[0];
        expect(indexFile.filename).to.equal(
          `${mockConfig.sourceDir}/index.html`
        );
      });
    });

    it("passes the layout context down to the children", () => {
      mockLayoutFilesystem();

      return fileTree.buildFromSourceDir().then(tree => {
        const indexFile = tree[0];
        expect(indexFile.context).to.include({
          layoutContextField: 1,
          indexContextField: 2
        });
      });
    });

    it("does not pass the 'children' context field from the layout template to the child", () => {
      mockLayoutFilesystem();

      return fileTree.buildFromSourceDir().then(tree => {
        const indexFile = tree[0];
        expect(indexFile.context.children[0].context.children).be.empty;
      });
    });
  });
});
