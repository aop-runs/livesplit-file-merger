//Based on: https://www.geeksforgeeks.org/reactjs/drag-and-drop-file-upload-component-with-react-hooks/ & https://medium.com/@dprincecoder/creating-a-drag-and-drop-file-upload-component-in-react-a-step-by-step-guide-4d93b6cc21e0
import React, { useRef } from 'react';
import styles from '../../styles/style.module.css'
import { isAValidFile, gatherFileContents } from '../../utils/file.js'

export const ItemUpload = ({ addListItem }) => {

    //Pre-included wrappers
    const wrapperRef = useRef(null);
    const onDragEnter = (e) => 
        wrapperRef.current.classList.add('dragover');
    const onDragLeave = (e) => 
        wrapperRef.current.classList.remove('dragover');
    
    //Add files upon dropping them in browser or by uplaod dialog
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
        for(let newFile of selectedFiles){
            if(newFile) {
                //Validate and gather contents
                if(!isAValidFile(newFile.name)){
                    alert("Invalid file: " + newFile.name + " uploaded.")
                    continue
                }
                let fileContents = gatherFileContents(newFile)
                
                //Add contents to list
                fileContents.then(
                    (contents) => {
                        addListItem(newFile.name, contents)
                    }
                );
                //Alert error
                fileContents.catch(
                    (error) => {
                        alert("Unable to upload: " + newFile.name + " - " + error)
                    }
                );
            }
        }
    }
    
    return (
        //File upload box
        <React.Fragment>
            <div ref={wrapperRef} className={styles.upload} onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDrop={onFileDrop}>
                <p>Drag & Drop your .txt files here</p>
                <input type="file" value= "" accept=".txt" onChange={onFileSelect} multiple/>
            </div>
        </React.Fragment>
    );
}