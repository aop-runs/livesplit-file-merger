//Based on: https://www.geeksforgeeks.org/reactjs/drag-and-drop-file-upload-component-with-react-hooks/ & https://medium.com/@dprincecoder/creating-a-drag-and-drop-file-upload-component-in-react-a-step-by-step-guide-4d93b6cc21e0
import React, { useRef } from 'react';
import styles from './style.module.css'

export const ItemUpload = ({ addListItem }) => {

    //Pre-included wrappers
    const wrapperRef = useRef(null);
    const onDragEnter = (e) => 
        wrapperRef.current.classList.add('dragover');
    const onDragLeave = (e) => 
        wrapperRef.current.classList.remove('dragover');
    
    //Add files upon dropping them in browser or by uplaod dialog
    const onDrop = (e) => {
        wrapperRef.current.classList.remove('dragover');
        e.preventDefault()
        for(let newFile of e.dataTransfer.files){
            if(newFile) {
                addListItem(newFile.name)
            }
        }
    }
    const onFileDrop = (e) => {
        for(let newFile of e.target.files){
            if(newFile) {
                addListItem(newFile.name)
            }
        }
    }
    

    return (
        <React.Fragment>
            <div ref={wrapperRef} className={styles.upload} onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDrop={onDrop}>
                <p>Drag & Drop your files here</p>
                <input type="file" onChange={onFileDrop} multiple/>
            </div>
        </React.Fragment>
    );
}