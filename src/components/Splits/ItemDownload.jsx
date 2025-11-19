import React, { useRef } from 'react';
import { prepareFileOutput, downloadFile, downloadFileAs } from '../../utils/file.js'

export const ItemDownload = ({ listItems }) => {
    
    //Gather output and download result to user's system and launch failback for browsers that don't support showSaveFilePicker Ex. Firefox
    const prepareDownload = () => {
        let contents = prepareFileOutput(listItems)
        let filename = "output.txt"
        let downloadPromise = typeof window.showSaveFilePicker === 'function' ? downloadFileAs(contents, filename) : downloadFile(contents, filename)
        //Successful download
        downloadPromise.then(
            (message) => {
                alert(message)
            }
        );

        //Alert error
        downloadPromise.catch(
            (error) => {
                //If user closes file dialog without saving anything
                if(error.name == "AbortError"){
                    alert("Abort Error (Ignore)")
                }
                else{
                    alert("Unable to download: " + filename + " - " + error)
                }
            }
        );
    }

    return (
        //File download button
        <React.Fragment>
            <button type="button" disabled={listItems.length < 2} onClick={prepareDownload}>Download Merged Splits</button>
        </React.Fragment>
    );
}