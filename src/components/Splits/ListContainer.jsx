//Based on: https://medium.com/@liadshiran92/easy-drag-and-drop-in-react-22778b30ba37
import React, { useState, useCallback } from 'react'
import { Item } from './Item'
import { ItemDownload } from './ItemDownload'
import { ItemUpload } from './ItemUpload'
import '../../styles/style.css'

export const ListContainer = () => {
    
    //Shared states
    const [files, setFiles] = useState([])
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
                setOutputName("")
                setUploadLabel("your")
            }
        },
        [files],
    )

    return (
        <React.Fragment>

            {/* List operations */}
            <p>First entry: {(files.length!=0 ? files[0].runName : "N/A")}</p>
            <button type="button" onClick={resetApplication} disabled={files.length==0}>Reset Application</button>
            <ItemUpload
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
                    itemData={file}
                    moveListItem={moveFileListItem}
                    removeListItem={removeFileListItem}
                />
            ))}
            </div>

            {/* Download merged contents */}
            <p>Entries: {files.length}</p>
            <ItemDownload
                listItems={files}
                outputName={outputName}
                setOutputName={setOutputName}
            />
        </React.Fragment>
    )
}