//Based on: https://www.geeksforgeeks.org/reactjs/drag-and-drop-file-upload-component-with-react-hooks/ & https://medium.com/@dprincecoder/creating-a-drag-and-drop-file-upload-component-in-react-a-step-by-step-guide-4d93b6cc21e0
import React, { useRef, useCallback } from 'react';
import { StatusPopUp } from '../Inputs/StatusPopUp.jsx'
import { BsCloudUpload } from "react-icons/bs";
import { gatherFileContents, validSpecifier } from '../../utils/file.js'
import { cleanSplitsFile, gatherRunName, findCustomComparisons, gatherSplitsDataByTag } from '../../utils/livesplit.js'
import '../../styles/style.scss'

export const FileUpload = ({ listItems, setListItems, refreshComparisons, appStatuses, updateStatus }) => {

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

    //Add entry to list
    const addFileListItem = useCallback(
        (itemData) => {
            setListItems(listItems => {
                const updatedFiles = [...listItems]
                updatedFiles.push({
                    ...{id: listItems.length+1},
                    ...itemData
                })
                refreshComparisons(updatedFiles)
                return updatedFiles
            })
        },
        [listItems],
    )

    //Validate and add files to list
    const uploadFiles = (selectedFiles) => {
        updateStatus("upload", {
            header: "Loading...",
            message: ["Adding " + selectedFiles.length.toString() + " file" + (selectedFiles.length != 1 ? "s" : " to entries")]
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
                            addFileListItem({
                                runName: gatherRunName(g, c),
                                game: g,
                                category: c,
                                filename: newFile[1].name,
                                layoutPath: gatherSplitsDataByTag(contents, "LayoutPath"),
                                offset: gatherSplitsDataByTag(contents, "Offset"),
                                comparisons: findCustomComparisons(contents),
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
                        if(newFile[0] == fileAmount-1){
                            if(uploadErrors.length == 0){
                                updateStatus("upload", {
                                    header: "Success",
                                    message: [fileAmount.toString() + " file" + (fileAmount != 1 ? "s" : "") + " added to entries"]
                                })
                            }
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
    }

    return (
        //File upload box
        <React.Fragment>
            <details open title="Click to open/close this section">
                <summary className ="sectionTitle">
                    File Upload
                </summary>
                {(appStatuses.upload.header.length > 0) && <StatusPopUp
                    header={appStatuses.upload.header}
                    message={appStatuses.upload.message}
                />}
                <div ref={wrapperRef} className="upload" onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDrop={onFileDrop} title="Click to Upload or Drag & Drop your .lss Files Here">
                    <p className="uploadButton"><BsCloudUpload /></p>
                    <input type="file" value= "" accept={validSpecifier.extension} onChange={onFileSelect} multiple/>
                </div>
            </details>
        </React.Fragment>
    );
}