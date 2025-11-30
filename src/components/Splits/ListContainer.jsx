//Based on: https://medium.com/@liadshiran92/easy-drag-and-drop-in-react-22778b30ba37
import React, { useState, useCallback } from 'react'
import { FileDownload } from './FileDownload'
import { FileUpload } from './FileUpload'
import { Item } from './Item'
import { iconCache } from "../../utils/livesplit.js";
import '../../styles/style.css'

export const ListContainer = () => {
    
    //Shared states
    const [files, setFiles] = useState([])
    const [unmaskPaths, setUnmaskPaths] = useState(false)
    const [uploadLabel, setUploadLabel] = useState("your")
    const [outputName, setOutputName] = useState("");

    //Alert user if they make any changes before refreshing or unloading website
    const alertUser = (event) => {
        event.preventDefault()
    }
    window.addEventListener("beforeunload", alertUser);

    // Pre-included move function
    const moveFileListItem = useCallback(
        (dragIndex, hoverIndex) => {
            const dragItem = files[dragIndex]
            const hoverItem = files[hoverIndex]
            // Swap places of dragItem and hoverItem in the files array
            setFiles(files => {
                const updatedFiles = [...files]
                updatedFiles[dragIndex] = hoverItem
                updatedFiles[hoverIndex] = dragItem
                return updatedFiles
            })
        },
        [files],
    )

    //Add entry to list
    const addFileListItem = useCallback(
        (itemData) => {
            setFiles(files => {
                const updatedFiles = [...files]
                updatedFiles.push({
                    ...{id: files.length+1},
                    ...itemData
                })
                return updatedFiles
            })
        },
        [files],
    )

    //Remove entry from list and refresh keys
    const removeFileListItem = useCallback(
        (index) => {
            setFiles(files => {
                const updatedFiles = [...files]
                updatedFiles.splice(index, 1)
                for(let i = 0; i < updatedFiles.length; i++) {
                    updatedFiles[i].id = i+1;
                }
                return updatedFiles
            })
        },
        [files],
    )

    //Prompt to reset application
    const resetApplication = useCallback(
        () => {
            if(confirm("Are you sure you want to reset eveything back to default?")){
                setFiles(files => {
                    const updatedFiles = [...files]
                    updatedFiles.length = 0
                    return updatedFiles
                })
                setUnmaskPaths(false)
                setUploadLabel("your")
                setOutputName("")
                iconCache.length = 0
            }
        },
        [files],
    )

    return (
        <React.Fragment>

            {/* List operations */}
            <label id="unmask" title="Unhide absolute filepath names for LiveSplit layouts">
                Unmask Filepaths: <input type="checkbox" for="unmask" checked={unmaskPaths} onChange={(e) => setUnmaskPaths(e.target.checked)}/>
            </label>
            <button type="button" onClick={resetApplication} disabled={files.length==0} title="Remove all entries and revert all settings to default">
                Reset Application
            </button>
            <FileUpload
                addListItem={addFileListItem}
                uploadLabel={uploadLabel}
                setUploadLabel={setUploadLabel}
            />

            {/* List entries */}
            <br />
            <div className="entry" title="All entries for LiveSplit files that will be included for your output splits in order">{files.map((file, index) => (
                <Item
                    key={file.id}
                    index={index}
                    listSize={files.length}
                    unmaskPaths={unmaskPaths}
                    itemData={file}
                    moveListItem={moveFileListItem}
                    removeListItem={removeFileListItem}
                />
            ))}
            </div>

            {/* Download merged contents */}
            <p title="Number of files used for output splits">
                Entries: {files.length}
            </p>
            <p title="The layout LiveSplit will use for your output splits">
                Starting Layout: {(files.length!=0 && files[0].layoutPath.length!=0 ? (unmaskPaths ? files[0].layoutPath : "*".repeat(files[0].layoutPath.length)) : "N/A")}
            </p>
            <p title="The offset LiveSplit will use for your output splits">
                Starting Offset: {(files.length!=0 ? files[0].offset : "N/A")}
            </p>
            <FileDownload
                listItems={files}
                outputName={outputName}
                setOutputName={setOutputName}
            />
        </React.Fragment>
    )
}