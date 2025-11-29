//Based on: https://medium.com/@liadshiran92/easy-drag-and-drop-in-react-22778b30ba37
import React, { useState, useCallback } from 'react'
import { FileDownload } from './FileDownload'
import { FileUpload } from './FileUpload'
import { Item } from './Item'
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
            }
        },
        [files],
    )

    return (
        <React.Fragment>

            {/* List operations */}
            <p>Starting Layout: {(files.length!=0 && files[0].layoutPath.length!=0 ? (unmaskPaths ? files[0].layoutPath : "*".repeat(files[0].layoutPath.length)) : "N/A")}</p>
            <p>Starting Offset: {(files.length!=0 ? files[0].offset : "N/A")}</p>
            <label id="unmask">Unmask Filepaths: <input type="checkbox" for="unmask" checked={unmaskPaths} onChange={(e) => setUnmaskPaths(e.target.checked)}/></label>
            <button type="button" onClick={resetApplication} disabled={files.length==0}>Reset Application</button>
            <FileUpload
                addListItem={addFileListItem}
                uploadLabel={uploadLabel}
                setUploadLabel={setUploadLabel}
            />

            {/* List entries */}
            <br />
            <div className="entry">{files.map((file, index) => (
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
            <p>Entries: {files.length}</p>
            <FileDownload
                listItems={files}
                outputName={outputName}
                setOutputName={setOutputName}
            />
        </React.Fragment>
    )
}