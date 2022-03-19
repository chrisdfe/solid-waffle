declare type Primitive = bigint | boolean | null | number | string | symbol | undefined;
export declare type PlainObject = {
    [key: string]: Primitive | PlainObject;
};
export declare type TemplateContext = {
    [key: string]: Primitive | PlainObject;
    layout?: string;
    body?: {
        content: string;
        context: TemplateContext;
    };
};
export declare type FileData = {
    filename: string;
    content: string;
    context: TemplateContext;
};
export declare type FileDataTree = Array<FileData | FileDataTree>;
export declare type Config = {
    sourceDir: string;
    destDir: string;
    layoutsDir: string;
    globalContext: TemplateContext;
};
export {};
