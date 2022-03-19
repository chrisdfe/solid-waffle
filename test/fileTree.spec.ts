import { expect } from "chai";
import * as yaml from "js-yaml";

import * as fileTree from "../src/fileTree";

import type { FileData } from '../src/types';

import { mockFs, createMockTemplateContents } from "./utils";

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

  it("generates a fileData tree", async () => {
    const mockConfig = createMockConfig();

    mockFs({
      "generator-config.yml": yaml.dump(mockConfig),
      [mockConfig.sourceDir]: {
        "index.html": "",
        posts: {
          post1: ""
        }
      }
    });

    const tree = await fileTree.buildFromSourceDir()
    expect(tree).to.be.an("array");
    expect(tree[0]).to.be.an("object");
    expect(tree[1]).to.be.an("array");
  });

  it("generates fileData with the correct shape", async () => {
    const mockConfig = createMockConfig();

    mockFs({
      "generator-config.yml": yaml.dump(mockConfig),
      [mockConfig.sourceDir]: {
        "index.html": ""
      }
    });

    const tree = await fileTree.buildFromSourceDir()
    expect(tree[0])
      .to.be.an("object")
      .that.has.all.keys(["filename", "content", "context"]);
  });

  describe("layout", () => {
    let mockConfig: any;

    const mockLayoutFilesystem = () => {
      mockConfig = createMockConfig();

      mockFs({
        "generator-config.yml": yaml.dump(mockConfig),
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

    it("nests the body field correctly", async () => {
      mockLayoutFilesystem();

      const tree = await fileTree.buildFromSourceDir()
      const firstItem = tree[0] as FileData;
      expect(firstItem).to.haveOwnProperty('content');

      expect(firstItem.content)
        .to.be.a("string")
        .that.includes("Layout Title");

      expect(firstItem.context.body)
        .to.be.an("object")
        .that.has.all.keys(["filename", "content", "context"]);

      // @ts-ignore
      expect(firstItem.context.body.content)
        .to.be.a("string")
        .that.includes("I want to be rendered inside of the default layout");
    });

    it("retains the original filename", async () => {
      mockLayoutFilesystem();

      const tree = await fileTree.buildFromSourceDir()
      const indexFile = tree[0];

      // @ts-ignore
      expect(indexFile.filename).to.equal(
        `${mockConfig.sourceDir}/index.html`
      );
    });

    it("passes context down to inheritees", async () => {
      mockLayoutFilesystem();

      const tree = await fileTree.buildFromSourceDir()
      const indexFile = tree[0];
      // @ts-ignore
      expect(indexFile.context).to.include({
        layoutContextField: 1,
        indexContextField: 2
      });
    });

    it("does not pass the 'body' context field from the layout template to the child", () => {
      mockLayoutFilesystem();

      return fileTree.buildFromSourceDir().then(tree => {
        const indexFile = tree[0];
        // @ts-ignore
        expect(indexFile.context.body.context.body).be.undefined;
      });
    });
  });
});
