const Promise = require("bluebird");
const yaml = require("js-yaml");

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
      context = yaml.safeLoad(yamlRaw);

      content = lines
        .slice(frontMatterDelineatorIndex + 1, lines.length)
        .join("\n");
    }

    return { context, content };
  });

module.exports = { extract };
