//Constants
export const validSpecifier = {
    extension: ".txt",
    streamType: 'text/plain',
    dialogLabel: "Text Files (*.txt)"
}

// Ensure only valid files are being uploaded
export function isAValidFile(filename){
    return filename.endsWith(validSpecifier.extension)
}

// Gather contents from file via Promise
export async function gatherFileContents(filename){
    return await new Promise(function(resolve, reject) {
        //Gather file contents
        try{
            let fileReader = new FileReader()
            fileReader.onloadend = (e) => {
                resolve(fileReader.result);
            }
            fileReader.readAsText(filename)
        //Catch error
        } catch (error) {
            reject(error)
        }
    });
}

//Prepare output for download
export function prepareFileOutput(items){
    return (items).map(item => item.text).join("\n")
}

//Download file (Failback function that downloads output to Downloads folder)
export async function downloadFile(contents, filename){
    return await new Promise(function(resolve, reject) {
        //File downloader
        try{
            if(!isAValidFile(filename)){
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
            reject(error)
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
                if(!isAValidFile(fileHandle.name)){
                    throw new Error(fileHandle.name + " from file dialog is not a valid filename");
                }
                const writableFileStream = await fileHandle.createWritable();
                await writableFileStream.write(new Blob([contents], { type: validSpecifier.streamType }));
                await writableFileStream.close();
                resolve("Success");
            //Catch error
            } catch (error) {
                reject(error)
            }
        }
        launchPromise();
    });
}