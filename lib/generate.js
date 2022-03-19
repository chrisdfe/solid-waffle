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
import { render as renderEJS } from "ejs";
const marked = require("marked");
const fileTree = require("./fileTree");
const fsUtils = require("./fsUtils");
const readConfig = require("./readConfig");
const removeDestFolder = () => __awaiter(void 0, void 0, void 0, function* () {
    fs.rmdir(readConfig().destDir);
});
const getParentDirectory = (filename) => filename
    .split("/")
    .slice(0, -1)
    .join("/");
const getFilenameExtension = (filename) => {
    const pieces = filename.split(".");
    return pieces[pieces.length - 1];
};
const renderTemplate = (filename, template, context) => __awaiter(void 0, void 0, void 0, function* () {
    const output = yield renderEJS(template, context);
    if (getFilenameExtension(filename) === "md") {
        return marked(output);
    }
    return output;
});
const writeFiledataToFilesystem = (fileData) => __awaiter(void 0, void 0, void 0, function* () {
    let { filename, context, content } = fileData;
    // render context body first
    if (context.body) {
        const renderedBody = yield renderTemplate(filename, context.body.content, context.body.context);
        context.body = renderedBody;
    }
    const compiled = yield renderTemplate(filename, content, context);
    const destPath = fsUtils.sourcePathToDestPath(filename);
    const parentDirectory = getParentDirectory(destPath);
    yield fs.mkdir(parentDirectory, { recursive: true });
    yield fs.writeFile(destPath, compiled);
});
const writeFileTreeToFilesystem = (fileTree) => __awaiter(void 0, void 0, void 0, function* () {
    yield Promise.all(fileTree.map(fileData => {
        if (Array.isArray(fileData)) {
            return writeFileTreeToFilesystem(fileData);
        }
        else {
            return writeFiledataToFilesystem(fileData);
        }
    }));
});
const generateSite = () => __awaiter(void 0, void 0, void 0, function* () {
    yield removeDestFolder();
    const newFileTree = yield fileTree.buildFromSourceDir();
    yield writeFileTreeToFilesystem(newFileTree);
});
export default generateSite;
