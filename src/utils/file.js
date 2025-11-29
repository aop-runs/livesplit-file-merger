//Constants
export const layoutExtension = ".lsl";
export const validSpecifier = {
    extension: ".lss",
    streamType: 'text/xml',
    dialogLabel: "LiveSplit Splits (*.lss)"
};

// Ensure only valid files are being uploaded
export function isAValidFile(filename, extension){
    return filename.endsWith(extension);
}

// Gather contents from file via Promise
export async function gatherFileContents(filename){
    return await new Promise(function(resolve, reject) {
        //Gather file contents
        try{
            if(!isAValidFile(filename.name, validSpecifier.extension)){
                throw new Error("Invalid file: " + filename.name + " uploaded");
            }
            let fileReader = new FileReader();
            fileReader.onloadend = (e) => {
                resolve(fileReader.result);
            }
            fileReader.readAsText(filename);
        //Catch error
        } catch (error) {
            reject(error);
        }
    });
}

//Open LiveSplit XML in new tab
export function openContentsInNewTab(contents){
    let url = URL.createObjectURL(new Blob([contents], {type: validSpecifier.streamType}));
    window.open(url);
    URL.revokeObjectURL(url);
}

//Download file (Failback function that downloads output to Downloads folder)
export async function downloadFile(contents, filename){
    return await new Promise(function(resolve, reject) {
        //File downloader
        try{
            if(!isAValidFile(filename, validSpecifier.extension)){
                throw new Error(filename + " is not a valid filename");
            }
            const link = document.createElement("a");
            link.href = URL.createObjectURL(new Blob([contents], { type: validSpecifier.streamType }));
            link.download = filename;
            link.click();
            URL.revokeObjectURL(link.href);
            resolve("Success");
        //Catch error
        } catch (error) {
            reject(error);
        }
    });
}

//Download file as
export async function downloadFileAs(contents, filename){
    return await new Promise(function(resolve, reject) {
        async function launchPromise() {
            //File picker
            try{
                const fileHandle = await window.showSaveFilePicker({
                    suggestedName: filename,
                    startIn: 'downloads',
                    types: [
                        {
                            description: validSpecifier.dialogLabel,
                            accept: {
                                [validSpecifier.streamType]: [validSpecifier.extension],
                            },
                        },
                    ],
                });
                //Writable stream
                if(!isAValidFile(fileHandle.name, validSpecifier.extension)){
                    throw new Error(fileHandle.name + " from file dialog is not a valid filename");
                }
                const writableFileStream = await fileHandle.createWritable();
                await writableFileStream.write(new Blob([contents], { type: validSpecifier.streamType }));
                await writableFileStream.close();
                resolve("Success");
            //Catch error
            } catch (error) {
                reject(error);
            }
        }
        launchPromise();
    });
}