const _ = require("lodash");
const yaml = require("js-yaml");

const fsUtils = require("./fsUtils");

const isFrontMatterDelineator = line => line.match(/^-{3,}$/g);

const getFrontMatterDelineatedLineIndex = lines => {
  for (let i = 0; i < lines.length; i++) {
    if (isFrontMatterDelineator(lines[i])) {
      return i;
    }
  }
  return -1;
};

const extract = async contents => {
  const lines = contents.split("\n");

  const frontMatterDelineatorIndex = getFrontMatterDelineatedLineIndex(lines);

  let context = {};
  let content = contents;

  if (frontMatterDelineatorIndex > -1) {
    const yamlRaw = lines.slice(0, frontMatterDelineatorIndex).join("\n");

    if (yamlRaw.length > 0) {
      context = yaml.safeLoad(yamlRaw);
    }

    content = lines
      .slice(frontMatterDelineatorIndex + 1, lines.length)
      .join("\n");
  }

  return { context, content };
}

const extractFromFile = async filename => {
  const contents = await fsUtils.loadFileContents(filename)
  return extract(contents)
}

module.exports = { extract, extractFromFile };
