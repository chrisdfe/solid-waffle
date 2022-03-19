var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { defaultsDeep } from "lodash-es";
import { promises as fs } from 'fs';
import { load as loadYaml } from "js-yaml";
const defaults = {
    sourceDir: "src",
    destDir: "dist",
    layoutsDir: "src/layouts",
    globalContext: {
        layout: false
    }
};
// TODO
// 1) make sure filepath is relative to root
// 2) cache config in a way that doesn't break tests
// 3) configurable config file name
const readConfig = () => __awaiter(void 0, void 0, void 0, function* () {
    const rawConfig = loadYaml(yield fs.readFile("generator-config.yml", "utf8"));
    return defaultsDeep(rawConfig, defaults);
});
export default readConfig;
