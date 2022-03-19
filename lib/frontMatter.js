var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// const _ = require("lodash");
import { load as loadYaml } from "js-yaml";
const fsUtils = require("./fsUtils");
const isFrontMatterDelineator = (line) => line.match(/^-{3,}$/g);
const getFrontMatterDelineatedLineIndex = (lines) => {
    for (let i = 0; i < lines.length; i++) {
        if (isFrontMatterDelineator(lines[i])) {
            return i;
        }
    }
    return -1;
};
export const extract = (contents) => __awaiter(void 0, void 0, void 0, function* () {
    const lines = contents.split("\n");
    const frontMatterDelineatorIndex = getFrontMatterDelineatedLineIndex(lines);
    let context = {};
    let content = contents;
    if (frontMatterDelineatorIndex > -1) {
        const yamlRaw = lines.slice(0, frontMatterDelineatorIndex).join("\n");
        if (yamlRaw.length > 0) {
            context = loadYaml(yamlRaw);
        }
        content = lines
            .slice(frontMatterDelineatorIndex + 1, lines.length)
            .join("\n");
    }
    return { context, content };
});
export const extractFromFile = (filename) => __awaiter(void 0, void 0, void 0, function* () {
    const contents = yield fsUtils.loadFileContents(filename);
    return extract(contents);
});
module.exports = { extract, extractFromFile };
