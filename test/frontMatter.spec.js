const chai = require("chai");
const mock = require("mock-fs");
const yaml = require("js-yaml");

const frontMatter = require("../static-site-generator/frontMatter");

const expect = chai.expect;

describe("frontMatter", () => {
  it("exists", () => {
    expect(frontMatter)
      .to.exist.and.be.an("object")
      .that.has.all.keys(["extract", "extractFromFile"]);
  });

  describe("extract", () => {
    it("has the expected return shape", () => {
      const input = [
        yaml.safeDump({
          firstKey: 1,
          secondKey: 2
        }),
        "----",
        "<h2>html goes here.</h2>"
      ].join("\n");

      return frontMatter.extract(input).then(result => {
        expect(result)
          .to.be.an("object")
          .that.has.all.keys("content", "context");
      });
    });

    it("parses the context correctly", () => {
      const input = [
        yaml.safeDump({
          numberKey: 1,
          stringKey: "hello",
          objectKey: {
            nestedKey: 4
          }
        }),
        "------",
        "<h2>Here is some html</h2>"
      ].join("\n");

      return frontMatter.extract(input).then(({ context }) => {
        expect(context)
          .to.be.an("object")
          .that.has.all.keys("numberKey", "stringKey", "objectKey");

        expect(context.numberKey).to.equal(1);
        expect(context.stringKey).to.equal("hello");
        expect(context.objectKey)
          .to.be.an("object")
          .that.has.all.keys("nestedKey");
      });
    });

    it("handles blank front matter gracefully", () => {
      // prettier-ignore
      const input = [
        "",
        "------",
        "<h2>Here is some html</h2>"
      ].join("\n");

      return frontMatter.extract(input).then(({ context }) => {
        expect(context).to.be.an("object").that.is.empty;
      });
    });

    it("parses the content correctly", () => {
      const inputPieces = [
        yaml.safeDump({
          numberKey: 1,
          stringKey: "hello",
          objectKey: {
            nestedKey: 4
          }
        }),
        "------",
        "<h2>Here is some html</h2>"
      ];
      const input = inputPieces.join("\n");

      return frontMatter.extract(input).then(({ content }) => {
        expect(content)
          .to.be.a("string")
          .that.equals(inputPieces[2]);
      });
    });
  });

  it("returns the correct object even with blank input", () => {
    return frontMatter.extract("").then(result => {
      expect(result)
        .to.be.an("object")
        .that.has.all.keys("content", "context");

      expect(result.context).to.be.an("object");
      expect(result.content).to.be.a("string");
    });
  });

  xdescribe("extractFromFile");
});
