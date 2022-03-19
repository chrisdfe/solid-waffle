type Primitive =
    | bigint
    | boolean
    | null
    | number
    | string
    | symbol
    | undefined;

export type PlainObject = { [key: string]: Primitive | PlainObject }

export type TemplateContext = {
    [key: string]: Primitive | PlainObject,
    layout?: string,
    body?: {
        content: string,
        context: TemplateContext
    }
};

export type FileData = {
    filename: string,
    content: string,
    context: TemplateContext
}

export type FileDataTree = Array<FileData | FileDataTree>

export type Config = {
    sourceDir: string,
    destDir: string,
    layoutsDir: string,
    globalContext: TemplateContext
};