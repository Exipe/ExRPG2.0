import { fileOpen, fileSave } from "browser-fs-access";

export type MapFile = {
    jsonContent: string,
    fileName: string
}

export const loadFile = async () => {
    const file = await fileOpen({
        mimeTypes: ['application/json'],
    });

    const jsonContent = await file.text();
    return {
        fileName: file.name,
        jsonContent
    } as MapFile;
}

export const saveFile = async (fileName: string, contents: string) => {
    console.info("fileName", fileName)

    var blob = new Blob([contents], { type: 'application/json' })
    await fileSave(blob, {
        fileName,
        extensions: ['.json']
    });
}