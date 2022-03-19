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
const readConfig = require("./readConfig");
export const sourcePathToDestPath = (srcPath) => [readConfig().destDir, ...srcPath.split("/").slice(1)].join("/");
export const loadFileContents = (filename) => __awaiter(void 0, void 0, void 0, function* () {
    const contents = yield fs.readFile(filename);
    return contents.toString();
});
