//Based on: https://www.geeksforgeeks.org/reactjs/drag-and-drop-file-upload-component-with-react-hooks/ & https://medium.com/@dprincecoder/creating-a-drag-and-drop-file-upload-component-in-react-a-step-by-step-guide-4d93b6cc21e0
import React, { useRef, useState } from 'react';
import { StatusBox } from '../StatusBox.jsx'
import { gatherFileContents, validSpecifier } from '../../utils/file.js'
import { cleanSplitsFile, gatherRunName, gatherSplitsDataByTag } from '../../utils/livesplit.js'
import '../../styles/style.css'

export const FileUpload = ({ addListItem, uploadLabel, setUploadLabel, appStatuses, updateStatus, initialStatus }) => {

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
                            addListItem({
                                runName: gatherRunName(g, c),
                                game: g,
                                category: c,
                                filename: newFile[1].name,
                                layoutPath: gatherSplitsDataByTag(contents, "LayoutPath"),
                                offset: gatherSplitsDataByTag(contents, "Offset"),
                                contents: contents
                            })
                        } catch (error) {
                            uploadErrors.push("Unable to upload: " + newFile[1].name + " - " + error)
                            updateStatus("upload", {
                                header: "Error",
                                message: uploadErrors
                            })
                        }
                        //All items uploaded successfully
                        if(newFile[0] == fileAmount-1 && uploadErrors.length == 0){
                            updateStatus("upload", {
                                header: "Success",
                                message: [fileAmount.toString() + " file" + (fileAmount != 1 ? "s" : "") + " added to entries"]
                            })
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
    
    return (
        //File upload box
        <React.Fragment>
            {(appStatuses.upload.header.length > 0) && <StatusBox
                header={appStatuses.upload.header}
                message={appStatuses.upload.message}
                hideStatus={() => updateStatus("upload", initialStatus)}
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