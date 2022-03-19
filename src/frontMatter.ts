// const _ = require("lodash");
import { load as loadYaml } from "js-yaml";

const fsUtils = require("./fsUtils");

const isFrontMatterDelineator = (line: string) => line.match(/^-{3,}$/g);

const getFrontMatterDelineatedLineIndex = (lines: string[]) => {
  for (let i = 0; i < lines.length; i++) {
    if (isFrontMatterDelineator(lines[i])) {
      return i;
    }
  }
  return -1;
};

export const extract = async (contents: string) => {
  const lines = contents.split("\n");

  const frontMatterDelineatorIndex = getFrontMatterDelineatedLineIndex(lines);

  let context = {};
  let content = contents;

  if (frontMatterDelineatorIndex > -1) {
    const yamlRaw = lines.slice(0, frontMatterDelineatorIndex).join("\n");

    if (yamlRaw.length > 0) {
      context = (loadYaml(yamlRaw) as any);
    }

    content = lines
      .slice(frontMatterDelineatorIndex + 1, lines.length)
      .join("\n");
  }

  return { context, content };
}

export const extractFromFile = async (filename: string) => {
  const contents = await fsUtils.loadFileContents(filename)
  return extract(contents)
}

module.exports = { extract, extractFromFile };
