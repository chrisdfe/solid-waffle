var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { promises as fs } from 'fs';
import * as path from "path";
import cloneDeep from 'lodash-es/cloneDeep';
import * as frontMatter from "./frontMatter";
import readConfig from "./readConfig";
const getDirectoryNameFromFullPath = (path) => path
    .split("/")
    .slice(-1)
    .join("/");
// Builds a fileData object for a file. Doesn't check for layout etc
const buildFileData = (filename) => __awaiter(void 0, void 0, void 0, function* () {
    const { content, context: localContext } = yield frontMatter.extractFromFile(filename);
    const context = Object.assign(Object.assign({}, (yield readConfig()).globalContext), localContext);
    return { filename, content, context };
});
// Makes the currentFileData the body of the layout it inherits from.
const inheritLayout = (layoutFilename, currentFileData) => __awaiter(void 0, void 0, void 0, function* () {
    const config = yield readConfig();
    const layoutPath = path.join(config.layoutsDir, layoutFilename);
    const layoutFileData = yield buildFileData(layoutPath);
    const inheritedFileData = cloneDeep(layoutFileData);
    // Inherit context from layout
    Object.assign(inheritedFileData.context, cloneDeep(currentFileData.context));
    // Set the body field
    inheritedFileData.context.body = currentFileData;
    // Retain current filename (otherwise it will use the layout template's filename)
    inheritedFileData.filename = currentFileData.filename;
    return inheritedFileData;
});
// TODO - better name for this.
const buildFileDataFull = (filename) => __awaiter(void 0, void 0, void 0, function* () {
    const fileData = yield buildFileData(filename);
    const { layout } = fileData.context;
    if (layout) {
        return inheritLayout(layout, fileData);
    }
    return fileData;
});
// TODO
// a) inherit context
// b) have a directory blacklist to prevent expanding layouts, partials etc
// const buildFileTreeFromDirectory = async (directory: string, inheritedContext) => {
const buildFileTreeFromDirectory = (directory) => __awaiter(void 0, void 0, void 0, function* () {
    const config = yield readConfig();
    const directories = yield fs.readdir(directory);
    const fullDirectories = directories.map(filename => path.join(directory, filename));
    return Promise.all(fullDirectories.map((filename) => __awaiter(void 0, void 0, void 0, function* () {
        const stats = yield fs.lstat(filename);
        if (stats.isDirectory()) {
            if (getDirectoryNameFromFullPath(filename).startsWith("_") ||
                filename === config.layoutsDir) {
                return [];
            }
            return buildFileTreeFromDirectory(filename);
        }
        return buildFileDataFull(filename);
    })));
});
const buildFromSourceDir = () => __awaiter(void 0, void 0, void 0, function* () {
    const config = yield readConfig();
    return buildFileTreeFromDirectory(config.sourceDir);
});
module.exports = {
    buildFromSourceDir
};
