//Based on: https://medium.com/@liadshiran92/easy-drag-and-drop-in-react-22778b30ba37
import React, { useState, useCallback } from 'react'
import { Item } from './Item'
import { ItemUpload } from './ItemUpload'
import styles from '../../styles/style.module.css'

export const ListContainer = () => {
    const [files, setFiles] = useState([])
    const [fileAmount, setFileAmount] = useState(0);

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
        (filename, contents) => {
            setFiles(files => {
                const updatedFiles = [...files]
                updatedFiles.push({
                    id: files.length+1,
                    name: filename,
                    text: contents
                })
                return updatedFiles
            })
            setFileAmount(fileAmount => fileAmount + 1)
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
            setFileAmount(fileAmount => fileAmount - 1)
        },
        [files],
    )

    //Prompt to clear list
    const clearFileList = useCallback(
        () => {
            if(confirm("Are you sure you want to clear all of your split entries?")){
                setFiles(files => {
                    const updatedFiles = [...files]
                    updatedFiles.length = 0
                    return updatedFiles
                })
                setFileAmount(fileAmount => 0)
            }
        },
        [files],
    )

    return (
        <React.Fragment>
            
            {/* List operations */}
            <p>Entries: {fileAmount}</p>
            <p>First entry: {(fileAmount!=0 ? files[0].name : "N/A")}</p>
            <button type="button" onClick={clearFileList} disabled={fileAmount==0}>Clear List</button>
            <ItemUpload
                addListItem={addFileListItem}
            />

            {/* List entries */}
            <div className={styles.entry}>{files.map((file, index) => (
                <Item
                    key={file.id}
                    index={index}
                    listSize={fileAmount}
                    name={file.name}
                    text={file.text}
                    moveListItem={moveFileListItem}
                    removeListItem={removeFileListItem}
                />
            ))}
            </div>

            {/* Download merged contents */}
            <button type="button" disabled={fileAmount==0}>Download Merged Splits</button>

        </React.Fragment>
    )
}