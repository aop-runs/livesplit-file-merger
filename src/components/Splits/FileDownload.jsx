import React from 'react';
import { BsCloudDownload } from "react-icons/bs";
import { GoTrash } from "react-icons/go";
import { StatusPopUp } from '../Inputs/StatusPopUp.jsx'
import { TextField } from '../Inputs/TextField.jsx'
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
    const forcePrepareOutput = () => {
        if((Array.from(new Set(Object.values(canDownload)))[0] == true && new Set(Object.values(canDownload)).size == 1)){
            prepareOutputSplits(finalOutput.filename.replace(validSpecifier.extension, ""))
        }
    }

    //Clear output data
    const clearOutputData = () => {
        setFinalOutput(finalOutput => {
            const updatedFinalOutput = {...finalOutput}
            updatedFinalOutput.output = {name: "", data: ""}
            return updatedFinalOutput
        })
        updateStatus("output")
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
            <details open title="Click to open/close this section">
                <summary className ="sectionTitle">
                    Output Download
                </summary>
                {/* File Preparation */}
                {(appStatuses.output.header.length > 0) && <StatusPopUp
                    header={appStatuses.output.header}
                    message={appStatuses.output.message}
                />}
                <TextField
                    title={"Filename"}
                    unmaskCon={true}
                    moveCursorToEnd={false}
                    disableCon={listItems.length < 2}
                    placeholderText={"filename.lss"}
                    changeableValue={finalOutput.filename}
                    updateFunction={updateFilename}
                    enterFunction={{
                        function: forcePrepareOutput,
                        enableCon: finalOutput.filename.length != 0
                    }}
                    description={"Filename for output splits file"}
                    defaultButton={{
                        value: getDefaultFilename(),
                        description: "Set default output filename based on the name of the run"
                    }}
                />       
                <br/>
                <button type="button" disabled={listItems.length < 2 || finalOutput.filename.length == 0 || !(Array.from(new Set(Object.values(canDownload)))[0] == true && new Set(Object.values(canDownload)).size == 1)} onClick={() => prepareOutputSplits(finalOutput.filename.replace(validSpecifier.extension, ""))} title="Prepares output file for combined splits that can be downloaded">
                        Prepare Output Splits
                </button>

            {/* File Download */}
            {finalOutput.output.name.length != 0 &&
                <React.Fragment>
                <br/><br/>
                {(appStatuses.download.header.length > 0) && <StatusPopUp
                    header={appStatuses.download.header}
                    message={appStatuses.download.message}
                />}
                <div className="download-wrapper" title="Download link for output splits file">
                    <label className = "download-splits-name" onClick={() => openContentsInNewTab(finalOutput.output.data, gatherSplitsDataByTag(finalOutput.output.data, "LayoutPath"), !unmaskPaths)} title = "Click on the filename to view its raw contents before downloading">
                        {finalOutput.output.name}
                    </label>
                    <button className = "download-button-icon download-button-1" onClick={launchDownload} title="Prepares download for your output splits file">
                        <BsCloudDownload />
                    </button>
                    <button className = "download-button-icon download-button-2" onClick={clearOutputData} title="Clear data from your final output splits">
                        <GoTrash />
                    </button>
                </div>
                </React.Fragment>
            }
            </details>
        </React.Fragment>

    );
}