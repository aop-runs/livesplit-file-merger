import React, { useState } from 'react';
import { StatusBox } from '../StatusBox.jsx'
import { downloadFile, downloadFileAs, validSpecifier, isAValidFile } from '../../utils/file.js'

export const FileDownload = ({ listItems, outputName, setOutputName }) => {

    //Status box tracking
    const initialStatus = {
        header: "",
        message: [""]
    }
    const [status, setStatus] = useState(initialStatus);
    const resetStatus = () => {
        setStatus(initialStatus)
    }

    //Track filename and ensure result is valid
    const [outputNameValid, setOutputNameValid] = useState(true);
    const updateFilename = (name) => {
        setOutputName(name)
        checkFilename(name)
    }
    const checkFilename = (name) => {
        //No unsupported filename characters
        let hasInvalid = false
        for(let char of ["<", ">", ":", "\"", "'", "/", "\\", "|", "?", "*", "&"]) {
            if(name.includes(char)){
                hasInvalid = true
                break
            }
        }
        
        //Extension is relevant if provided
        if(hasInvalid || (name.includes(".") && !isAValidFile(name, validSpecifier.extension))){
            setOutputNameValid(false)
            setStatus({
                header: "Error",
                message: [name + " is not a valid filename"]
            })
        }
        else{
            setOutputNameValid(true)
            resetStatus()
        }
    }

    //Gather output and download result to user's system and launch failback for browsers that don't support showSaveFilePicker Ex. Firefox
    const prepareDownload = (name) => {
        let contents = "Test"
        let downloadPromise = typeof window.showSaveFilePicker === 'function' ? downloadFileAs(contents, name + validSpecifier.extension) : downloadFile(contents, name + validSpecifier.extension)
        //Successful download
        downloadPromise.then(
            (head) => {
                setStatus({
                    header: "Success",
                    message: ["Download for " + outputName + " successful"]
                })
            }
        );

        //Alert error
        downloadPromise.catch(
            (error) => {
                //If user closes file dialog without saving anything
                if(error.name == "AbortError"){
                    return
                }
                else{
                    setStatus({
                        header: "Error",
                        message: ["Unable to download: " + outputName + " - " + error]
                    })
                }
            }
        );
    }

    return (
        //File download button
        <React.Fragment>
            {(status.header.length > 0 && outputName.length != 0) && <StatusBox
                header={status.header}
                message={status.message}
                hideStatus={resetStatus}
            />}
            <div title="Filename for output splits file">
                <label>
                    Output filename: 
                </label>
                <input type="text" disabled={listItems.length < 2} placeholder={"output"} value={outputName} onChange={(e) => updateFilename(e.target.value)}/>
            </div>
            <button type="button" disabled={outputName.length == 0} onClick={() => updateFilename("")} title="Clear textfield for output's filename">
                Clear Filename
            </button>
            <button type="button" disabled={listItems.length < 2 || outputName.length == 0 || !outputNameValid} onClick={() => prepareDownload(outputName.replace(validSpecifier.extension, ""))} title="Download new output file for combined splits">
                Download Merged Splits
            </button>
        </React.Fragment>
    );
}