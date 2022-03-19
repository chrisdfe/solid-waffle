import { TemplateContext } from "./types";
export declare const extract: (contents: string) => Promise<{
    context: TemplateContext;
    content: string;
}>;
export declare const extractFromFile: (filename: string) => Promise<{
    context: TemplateContext;
    content: string;
}>;
