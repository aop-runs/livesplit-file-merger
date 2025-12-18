import React from 'react';
import { StatusBox } from '../StatusBox.jsx'
import { downloadFile, downloadFileAs, validSpecifier, isAValidFile, openContentsInNewTab } from '../../utils/file.js'
import { gatherSplitsDataByTag, createOutputSplits } from '../../utils/livesplit.js'
import '../../styles/style.scss'

export const FileDownload = ({ listItems, unmaskPaths, outputSettings, canDownload, updateCanDownload, finalOutput, setFinalOutput, appStatuses, updateStatus }) => {

    //Track filename
    const updateFilename = (name) => {
        setFinalOutput(finalOutput => {
            const updatedFinalOutput = {...finalOutput}
            updatedFinalOutput.filename = name
            return updatedFinalOutput
        })
        checkFilename(name)
    }

    //Gather default name by game and categories
    const getDefaultFilename = () => {
        let defaultName = []
        if(outputSettings["runName"].game.length != 0){
            defaultName.push(outputSettings["runName"].game)
        }
        if(outputSettings["runName"].category.length != 0){
            defaultName.push(outputSettings["runName"].category)
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
        if(hasInvalid || name == validSpecifier.extension || (name.includes(".") && !isAValidFile(name, validSpecifier.extension))){
            updateStatus("output", {
                header: "Error",
                message: [name + " is not a valid filename"]
            })
            updateCanDownload("output", false)
        }
        else{
            updateStatus("output")
            updateCanDownload("output", true)
        }
    }

    //Prepares output that can be downloaded to the user's filesystem
    const prepareOutputSplits = (filename) => {
        updateStatus("output", {
            header: "Loading...",
            message: ["Creating combined splits file named: " + filename + validSpecifier.extension + " using " + listItems.length.toString() + " entr" + (listItems.length != 1 ? "ies" : "y")]
        })
        updateStatus("download")
        setFinalOutput(finalOutput => {
            const updatedFinalOutput = {...finalOutput}
            updatedFinalOutput.data = {name: "", data: ""}
            return updatedFinalOutput
        })
        setTimeout(() => {
            let splitsData = createOutputSplits(listItems, outputSettings)
            try {
                updateStatus("output", {
                    header: "Success",
                    message: ["Output splits file named: " + filename + validSpecifier.extension + " is ready to be downloaded below"]
                })
            } catch (error){
                updateStatus("output", {
                    header: "Error",
                    message: ["Unable to create output splits file named: " + filename + validSpecifier.extension + " - " + error]
                })
                return
            }
            //Update output data
            setFinalOutput(finalOutput => {
                const updatedFinalOutput = {...finalOutput}
                updatedFinalOutput.output = {name: filename + validSpecifier.extension, data: splitsData}
                return updatedFinalOutput
            })
        }, 0)
    }

    //Gather output and download result to user's system and launch failback for browsers that don't support showSaveFilePicker Ex. Firefox
    const launchDownload = () => {
        let downloadPromise = typeof window.showSaveFilePicker === 'function' ? downloadFileAs(finalOutput.output) : downloadFile(finalOutput.output)
        //Successful download
        downloadPromise.then(
            () => {
                updateStatus("download", {
                    header: "Success",
                    message: ["Download for " + finalOutput.output.name + " successful"]
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
                        message: ["Unable to download: " + finalOutput.output.name + " - " + error]
                    })
                }
            }
        );
    }

    return (
        
        <React.Fragment>
            {/* File Preparation */}
            {(appStatuses.output.header.length > 0) && <StatusBox
                header={appStatuses.output.header}
                message={appStatuses.output.message}
                hideStatus={() => updateStatus("output")}
            />}
            <div title="Filename for output splits file">
                <label>Output Filename: </label>
                <input type="text" disabled={listItems.length < 2} placeholder={"filename.lss"} value={finalOutput.filename} onChange={(e) => updateFilename(e.target.value)}/>
                <button type="button" disabled={listItems.length < 2 || finalOutput.filename.length == 0} onClick={() => updateFilename("")} title="Clear textfield for output's filename">
                    Clear Filename
                </button>
                <button type="button" disabled={listItems.length < 2} onClick={() => updateFilename(getDefaultFilename())} title="Set default output filename based on the name of the run">
                    Set Default Filename
                </button>
                <button type="button" disabled={listItems.length < 2 || finalOutput.filename.length == 0 || !(Array.from(new Set(Object.values(canDownload)))[0] == true && new Set(Object.values(canDownload)).size == 1)} onClick={() => prepareOutputSplits(finalOutput.filename.replace(validSpecifier.extension, ""))} title="Prepares output file for combined splits that can be downloaded">
                    Prepare Output Splits
                </button>
            </div>

        {/* File Download */}
        {finalOutput.output.name.length != 0 &&
            <React.Fragment>
            {(appStatuses.download.header.length > 0) && <StatusBox
                header={appStatuses.download.header}
                message={appStatuses.download.message}
                hideStatus={() => updateStatus("download")}
            />}
            <div title="Download link for output splits file">
                <label>Output Contents: </label>
                <label className = "pointerCursor" onClick={() => openContentsInNewTab(finalOutput.output.data, gatherSplitsDataByTag(finalOutput.output.data, "LayoutPath"), !unmaskPaths)} title = "Click on the filename to view its raw contents before downloading">{finalOutput.output.name}</label>
                <button type="button" onClick={launchDownload} title="Prepares download for your output splits file">
                    Download Splits File
                </button>
                <button type="button" onClick={() => setFinalOutput({filename: finalOutput.filename, output: {name: "", data: ""}})} title="Clear data from your final output splits">
                    Clear Download
                </button>
            </div>
            </React.Fragment>
        }
        </React.Fragment>

    );
}