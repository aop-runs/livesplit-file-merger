//Based on: https://www.geeksforgeeks.org/reactjs/drag-and-drop-file-upload-component-with-react-hooks/ & https://medium.com/@dprincecoder/creating-a-drag-and-drop-file-upload-component-in-react-a-step-by-step-guide-4d93b6cc21e0
import React, { useRef, useState } from 'react';
import { StatusBox } from '../StatusBox.jsx'
import { gatherFileContents, validSpecifier } from '../../utils/file.js'
import { cleanSplitsFile, gatherRunName, findCustomComparisons, gatherSplitsDataByTag } from '../../utils/livesplit.js'
import '../../styles/style.css'

export const FileUpload = ({ addListItem, updateCanDownload, gameComp, uploadLabel, setUploadLabel, appStatuses, updateStatus }) => {

    //Pre-included wrappers
    const wrapperRef = useRef(null);
    const onDragEnter = (e) => 
        wrapperRef.current.classList.add('dragover');
    const onDragLeave = (e) => 
        wrapperRef.current.classList.remove('dragover');
    
    //Add files upon dropping them in browser or by upload dialog
    const onFileDrop = (e) => {
        wrapperRef.current.classList.remove('dragover');
        e.preventDefault()
        uploadFiles(e.dataTransfer.files)
    }
    const onFileSelect = (e) => {
        uploadFiles(e.target.files)
    }

    //Validate and add files to list
    const uploadFiles = (selectedFiles) => {
        updateStatus("upload", {
            header: "Loading...",
            message: ["Adding " + selectedFiles.length.toString() + " file" + (selectedFiles.length != 1 ? "s" : "")]
        })
        let uploadErrors = []
        let repeatComparisons = []
        let fileAmount = selectedFiles.length
        for(let newFile of Array.from(selectedFiles).entries()){
            if(newFile[1]) {
                let fileContents = gatherFileContents(newFile[1])
                
                //Add contents to list
                fileContents.then(
                    (contents) => {
                        try {
                            contents = cleanSplitsFile(contents)
                            let g = gatherSplitsDataByTag(contents, "GameName")
                            let c = gatherSplitsDataByTag(contents, "CategoryName")
                            let comp = findCustomComparisons(contents)
                            addListItem({
                                runName: gatherRunName(g, c),
                                game: g,
                                category: c,
                                filename: newFile[1].name,
                                layoutPath: gatherSplitsDataByTag(contents, "LayoutPath"),
                                offset: gatherSplitsDataByTag(contents, "Offset"),
                                comparisons: comp,
                                contents: contents
                            })
                            repeatComparisons = repeatComparisons.length != 0 ? repeatComparisons.filter(name => comp.includes(name)) : comp
                        } catch (error) {
                            uploadErrors.push("Unable to upload: " + newFile[1].name + " - " + error)
                            updateStatus("upload", {
                                header: "Error",
                                message: uploadErrors
                            })
                        }
                        //All items uploaded successfully where comparisons are also refreshed
                        if(newFile[0] == fileAmount-1){
                            if(uploadErrors.length == 0){
                                updateStatus("upload", {
                                    header: "Success",
                                    message: [fileAmount.toString() + " file" + (fileAmount != 1 ? "s" : "") + " added to entries"]
                                })
                            }
                            checkGameComp(repeatComparisons)
                        }
                    }
                );

                //Alert error
                fileContents.catch(
                    (error) => {
                        uploadErrors.push("Unable to upload: " + newFile[1].name + " - " + error)
                        updateStatus("upload", {
                            header: "Error",
                            message: uploadErrors
                        })
                    }
                );
            }
        }
        setUploadLabel("some more")
    }
    
    //Check game PB comparison name
    const checkGameComp = (repeatComparisons) => {
        if(gameComp.length == 0){
            updateStatus("comp", {
                header: "Warning",
                message: ["No game PB comparison name provided"]
            })
            updateCanDownload("comp", false)
        }
        else if(gameComp == "Personal Best"){
            updateStatus("comp", {
                header: "Error",
                message: ["Comparison cannot be named \'Personal Best\' as it's the default name for LiveSplit's PB comparison"]
            })
            updateCanDownload("comp", false)
        }
        else if(repeatComparisons.includes(gameComp)){
            updateStatus("comp", {
                header: "Error",
                message: ["Comparison cannot be named after an existing comparison that will be carried over in your output splits"]
            })
            updateCanDownload("comp", false)
        }
        else{
            updateStatus("comp")
            updateCanDownload("comp", true)
        }
    }

    return (
        //File upload box
        <React.Fragment>
            {(appStatuses.upload.header.length > 0) && <StatusBox
                header={appStatuses.upload.header}
                message={appStatuses.upload.message}
                hideStatus={() => updateStatus("upload")}
            />}
            <div ref={wrapperRef} className="upload" onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDrop={onFileDrop} title="Box where you you click to upload LiveSplit files or drag &drop them">
                <p>
                    Drag & Drop {uploadLabel} {validSpecifier.extension} files here
                </p>
                <input type="file" value= "" accept={validSpecifier.extension} onChange={onFileSelect} multiple/>
            </div>
        </React.Fragment>
    );
}