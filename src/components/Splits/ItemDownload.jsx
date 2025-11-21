import React, { useState } from 'react';
import { StatusBox } from './StatusBox'
import { prepareFileOutput, downloadFile, downloadFileAs, validSpecifier, isAValidFile } from '../../utils/file.js'

export const ItemDownload = ({ listItems }) => {

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
    const [filename, setFilename] = useState("");
    const [filenameValid, setFilenameValid] = useState(true);
    const updateFilename = (name) => {
        setFilename(name)
        //No unsupported filename characters
        let hasInvalid = false
        for(let char of ["<", ">", ":", "\"", "'", "/", "\\", "|", "?", "*", "&"]) {
            if(name.includes(char)){
                hasInvalid = true
                break
            }
        }
        
        //Extension is relevant if provided
        if(hasInvalid || (name.includes(".") && !isAValidFile(name))){
            setFilenameValid(false)
            setStatus({
                header: "Error",
                message: [name + " is not a valid filename"]
            })
        }
        else{
            setFilenameValid(true)
            resetStatus()
        }
    }

    //Gather output and download result to user's system and launch failback for browsers that don't support showSaveFilePicker Ex. Firefox
    const prepareDownload = (name) => {
        let contents = prepareFileOutput(listItems)
        let downloadPromise = typeof window.showSaveFilePicker === 'function' ? downloadFileAs(contents, name + validSpecifier.extension) : downloadFile(contents, name + validSpecifier.extension)
        //Successful download
        downloadPromise.then(
            (head) => {
                setStatus({
                    header: "Success",
                    message: ["Download for " + filename + " successful"]
                })
            }
        );

        //Alert error
        downloadPromise.catch(
            (error) => {
                //If user closes file dialog without saving anything
                if(error.name != "AbortError"){
                    return
                }
                else{
                    setStatus({
                        header: "Error",
                        message: ["Unable to download: " + filename + " - " + error]
                    })
                }
            }
        );
    }

    return (
        //File download button
        <React.Fragment>
            {(status.header.length > 0 && listItems.length != 0) && <StatusBox
                header={status.header}
                message={status.message}
                hideStatus={resetStatus}
            />}
            <label>Output filename: </label>
            <input type="text" disabled={listItems.length < 2} placeholder={"output"} value={filename} onChange={(e) => updateFilename(e.target.value)}></input>
            <button type="button" disabled={filename.length == 0} onClick={() => updateFilename("")}>Clear Filename</button>
            <button type="button" disabled={listItems.length < 2 || filename.length == 0 || !filenameValid} onClick={() => prepareDownload(filename.replace(validSpecifier.extension, ""))}>Download Merged Splits</button>
        </React.Fragment>
    );
}