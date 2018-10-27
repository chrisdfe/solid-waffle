const _ = require("lodash");
const yaml = require("js-yaml");

const createMockTemplateContents = params => {
  const {
    frontMatter = {},
    delineator = "---",
    content = "<p>test content</p>"
  } = params;

  const pieces = [];

  if (!_.isEmpty(frontMatter)) {
    pieces.push(yaml.safeDump(frontMatter));
  }

  pieces.push(delineator);
  pieces.push(content);

  return pieces.join("\n");
};

module.exports = { createMockTemplateContents };
