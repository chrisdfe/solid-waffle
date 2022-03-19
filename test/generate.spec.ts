import { expect } from "chai";
import * as yaml from "js-yaml";
import { promises as fs } from 'fs';
import * as path from 'path';

const { mockFs, createMockTemplateContents } = require("./utils");
const generate = require("../src/generate");

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

  it("outputs to dist/", async () => {
    const mockConfig = createMockConfig();

    mockFs({
      "generator-config.yml": yaml.dump(mockConfig),
      [mockConfig.sourceDir]: {
        "index.html": "",
        "404.html": ""
      }
    }, {
      createCwd: true,
      createTmp: true,
    });

    await generate()
    const distFiles = await fs.readdir(mockConfig.destDir);
    expect(distFiles)
      .to.be.an("array")
      .that.includes("index.html");
  });

  it("renders ejs correctly", async () => {
    const mockConfig = createMockConfig();

    const indexFileTemplate = createMockTemplateContents({
      frontMatter: { title: "Index Title" },
      content: "<h1><%= title %></h1>"
    });

    mockFs({
      "generator-config.yml": yaml.dump(mockConfig),
      [mockConfig.sourceDir]: {
        "index.html": indexFileTemplate
      }
    });

    await generate();

    const distFiles = await fs.readdir(mockConfig.destDir);

    const outputContents = (await fs
      .readFile(path.join(mockConfig.destDir, distFiles[0])))
      .toString();

    expect(outputContents)
      .to.be.a("string")
      .that.includes("Index Title");
  });

  it('renders markdown for files with a "md" filename extension', async () => {
    const mockConfig = createMockConfig();

    const indexFileTemplate = createMockTemplateContents({
      frontMatter: { title: "Index Title" },
      // prettier-ignore
      content: [
        "# <%= title %>",
        "This is a markdown file.",
      ].join("\n")
    });

    mockFs({
      "generator-config.yml": yaml.dump(mockConfig),
      [mockConfig.sourceDir]: {
        "index.md": indexFileTemplate
      }
    });

    generate()

    const distFiles = await fs.readdir(mockConfig.destDir);

    const outputContents = (await fs
      .readFile(path.join(mockConfig.destDir, distFiles[0])))
      .toString();

    expect(outputContents)
      .to.be.a("string")
      .that.includes(`Index Title`)
      .and.includes("<p>This is a markdown file.</p>");
  });

  it("handles nested directories correclty", async () => {
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

    await generate()
    const distFiles = await fs.readdir(mockConfig.destDir);

    expect(distFiles)
      .to.be.an("array")
      .that.includes("posts");

    const posts = await fs.readdir(path.join(mockConfig.destDir, distFiles[1]));

    expect(posts)
      .to.be.an("array")
      .that.includes("post1");
  });

  it("doesn't build directories prefixed with a '_'", async () => {
    const mockConfig = createMockConfig();

    mockFs({
      "generator-config.yml": yaml.dump(mockConfig),
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

    await generate()
    const distFiles = await fs.readdir(mockConfig.destDir);

    expect(distFiles).and.to.not.include("_ignoreThisDirectory");
  });

  it("doesn't build files in the layout directory", async () => {
    const mockConfig = createMockConfig();

    mockFs({
      "generator-config.yml": yaml.dump(mockConfig),
      [mockConfig.sourceDir]: {
        "index.html": ""
      },
      [mockConfig.layoutsDir]: {
        "default.html": ""
      }
    });

    await generate()
    const distFiles = await fs.readdir(mockConfig.destDir);

    expect(distFiles).and.to.not.include("testLayoutsDirectory");
  });

  it("renders template body correctly", async () => {
    const mockConfig = createMockConfig();

    mockFs({
      "generator-config.yml": yaml.dump(mockConfig),
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

    await generate()

    const distFiles = await fs.readdir(mockConfig.destDir);

    const indexFileContents = (await fs
      .readFile(path.join(mockConfig.destDir, distFiles[0])))
      .toString();

    expect(indexFileContents)
      .to.include("Layout Title")
      .and.include(
        "I would like to be rendered inside of the default layout please"
      );
  });
});
