const Promise = require("bluebird");
const yaml = require("js-yaml");

const fsUtils = require("./fsUtils");

const isFrontMatterDelineator = line => line.match(/^-{3,}$/g);

const frontMatterDelineatedLineIndex = lines => {
  for (let i = 0; i < lines.length; i++) {
    if (isFrontMatterDelineator(lines[i])) {
      return i;
    }
  }
  return -1;
};

const extract = contents =>
  Promise.try(() => {
    const lines = contents.split("\n");

    const frontMatterDelineatorIndex = frontMatterDelineatedLineIndex(lines);

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
  });

const extractFromFile = filename =>
  Promise.try(() => fsUtils.loadFileContents(filename)).then(contents =>
    extract(contents)
  );

module.exports = { extract, extractFromFile };
