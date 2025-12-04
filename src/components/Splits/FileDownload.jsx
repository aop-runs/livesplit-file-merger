import React, { useState } from 'react';
import { StatusBox } from '../StatusBox.jsx'
import { downloadFile, downloadFileAs, validSpecifier, isAValidFile } from '../../utils/file.js'

export const FileDownload = ({ listItems, outputName, setOutputName, runName, appStatuses, updateStatus, initialStatus }) => {

    //Track filename and ensure result is valid
    const [outputNameValid, setOutputNameValid] = useState(true);
    const updateFilename = (name) => {
        setOutputName(name)
        checkFilename(name)
    }
    const getDefaultFilename = () => {
        let defaultName = []
        if(runName.game.length != 0){
            defaultName.push(runName.game)
        }
        if(runName.category.length != 0){
            defaultName.push(runName.category)
        }
        if(defaultName.length == 0){
            return "Untitled"
        }
        let defaultResult = defaultName.join(" - ")
        for(let char of ["<", ">", ":", "\"", "'", "/", "\\", "|", "?", "*", "&"]) {
            defaultResult = defaultResult.replaceAll(char, "_")
        }
        return defaultResult
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
            updateStatus("download", {
                header: "Error",
                message: [name + " is not a valid filename"]
            })
        }
        else{
            setOutputNameValid(true)
            updateStatus("download", initialStatus)
        }
    }

    //Gather output and download result to user's system and launch failback for browsers that don't support showSaveFilePicker Ex. Firefox
    const prepareDownload = (name) => {
        let contents = "Test"
        let downloadPromise = typeof window.showSaveFilePicker === 'function' ? downloadFileAs(contents, name + validSpecifier.extension) : downloadFile(contents, name + validSpecifier.extension)
        //Successful download
        downloadPromise.then(
            (head) => {
                updateStatus("download", {
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
                    updateStatus("download", {
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
            {(appStatuses.download.header.length > 0) && <StatusBox
                header={appStatuses.download.header}
                message={appStatuses.download.message}
                hideStatus={() => updateStatus("download", initialStatus)}
            />}
            <div title="Filename for output splits file">
                <label>Output Filename: </label>
                <input type="text" disabled={listItems.length < 2} placeholder={"filename.lss"} value={outputName} onChange={(e) => updateFilename(e.target.value)}/>
                <button type="button" disabled={listItems.length < 2 || outputName.length == 0} onClick={() => updateFilename("")} title="Clear textfield for output's filename">
                    Clear Filename
                </button>
                <button type="button" disabled={listItems.length < 2} onClick={() => updateFilename(getDefaultFilename())} title="Set default output filename based on the name of the run">
                    Set Default Filename
                </button>
                <button type="button" disabled={listItems.length < 2 || outputName.length == 0 || !outputNameValid} onClick={() => prepareDownload(outputName.replace(validSpecifier.extension, ""))} title="Download new output file for combined splits">
                    Download Merged Splits
                </button>
            </div>
        </React.Fragment>
    );
}