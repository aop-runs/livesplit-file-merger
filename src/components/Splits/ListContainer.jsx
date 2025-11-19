//Based on: https://medium.com/@liadshiran92/easy-drag-and-drop-in-react-22778b30ba37
import React, { useState, useCallback } from 'react'
import { Item } from './Item'
import { ItemDownload } from './ItemDownload'
import { ItemUpload } from './ItemUpload'
import styles from '../../styles/style.module.css'

export const ListContainer = () => {
    const [files, setFiles] = useState([])

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

    //Prompt to clear list
    const clearFileList = useCallback(
        () => {
            if(confirm("Are you sure you want to clear all of your split entries?")){
                setFiles(files => {
                    const updatedFiles = [...files]
                    updatedFiles.length = 0
                    return updatedFiles
                })
            }
        },
        [files],
    )

    return (
        <React.Fragment>

            {/* List operations */}
            <p>Entries: {files.length}</p>
            <p>First entry: {(files.length!=0 ? files[0].name : "N/A")}</p>
            <button type="button" onClick={clearFileList} disabled={files.length==0}>Clear List</button>
            <ItemUpload
                addListItem={addFileListItem}
            />

            {/* List entries */}
            <div className={styles.entry}>{files.map((file, index) => (
                <Item
                    key={file.id}
                    index={index}
                    listSize={files.length}
                    name={file.name}
                    text={file.text}
                    moveListItem={moveFileListItem}
                    removeListItem={removeFileListItem}
                />
            ))}
            </div>

            {/* Download merged contents */}
            <ItemDownload
                listItems={files}
            />
        </React.Fragment>
    )
}