
export const loadFile = async () => {
    const [fileHandle] = await window.showOpenFilePicker();

    return await (await fileHandle.getFile()).text();
}

export const saveFile = async (contents: string) => {
    const fileHandle = await window.showSaveFilePicker();
    const writable = await fileHandle.createWritable();

    await writable.write(contents);
    await writable.close();
}