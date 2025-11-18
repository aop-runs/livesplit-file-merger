// Ensure only valid files are being uploaded
export function isAValidFile(filename){
    return filename.endsWith(".txt")
}

// Gather contents from file via Promise
export async function gatherFileContents(filename){
    let filePromise = new Promise(function(resolve, reject) {
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
    return await filePromise
}