import { isEmpty } from "lodash-es";
import * as yaml from "js-yaml";
import * as mockFilesystem from 'mock-fs';

export const createMockTemplateContents = (params: any) => {
  const {
    frontMatter = {},
    delineator = "---",
    content = "<p>test content</p>"
  } = params;

  const pieces = [];

  if (!isEmpty(frontMatter)) {
    pieces.push(yaml.dump(frontMatter));
  }

  pieces.push(delineator);
  pieces.push(content);

  return pieces.join("\n");
};

export const mockFs = (config: any) => mockFilesystem(config, { createCwd: true, createTmp: true })