//Based on: https://www.geeksforgeeks.org/reactjs/drag-and-drop-file-upload-component-with-react-hooks/ & https://medium.com/@dprincecoder/creating-a-drag-and-drop-file-upload-component-in-react-a-step-by-step-guide-4d93b6cc21e0
import React, { useRef, useState } from 'react';
import { StatusBox } from './StatusBox'
import { isAValidFile, gatherFileContents, validSpecifier } from '../../utils/file.js'
import { removeIconData, gatherRunName, gatherSplitsDataByTag } from '../../utils/livesplit.js'
import '../../styles/style.css'

export const ItemUpload = ({ addListItem, uploadLabel, setUploadLabel }) => {

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

    //Status box tracking
    const initialStatus = {
        header: "",
        message: [""]
    }
    const [status, setStatus] = useState(initialStatus);
    const resetStatus = () => {
        setStatus(initialStatus)
    }

    //Validate and add files to list
    const uploadFiles = (selectedFiles) => {
        let badFiles = []
        for(let newFile of selectedFiles){
            if(newFile) {
                let fileContents = gatherFileContents(newFile)
                
                //Add contents to list
                fileContents.then(
                    (contents) => {
                        try{
                            contents = removeIconData(contents)
                            addListItem(
                                gatherRunName(contents),
                                newFile.name, 
                                contents)
                        } catch (error) {
                            badFiles.push("Unable to upload: " + newFile.name + " - " + error)
                            setStatus({
                                header: "Error",
                                message: badFiles
                            })
                        }
                    }
                );
                //Alert error
                fileContents.catch(
                    (error) => {
                        badFiles.push("Unable to upload: " + newFile.name + " - " + error)
                        setStatus({
                            header: "Error",
                            message: badFiles
                        })
                    }
                );
            }
        }
        setUploadLabel("some more")
        setStatus({
            header: "Success",
            message: [selectedFiles.length.toString() + " file" + (selectedFiles.length != 1 ? "s" : "") + " added to entries"]
        })
    }
    
    return (
        //File upload box
        <React.Fragment>
            {(status.header.length > 0 && uploadLabel == "some more") && <StatusBox
                header={status.header}
                message={status.message}
                hideStatus={resetStatus}
            />}
            <div ref={wrapperRef} className="upload" onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDrop={onFileDrop}>
                <p>Drag & Drop {uploadLabel} {validSpecifier.extension} files here</p>
                <input type="file" value= "" accept={validSpecifier.extension} onChange={onFileSelect} multiple/>
            </div>
        </React.Fragment>
    );
}