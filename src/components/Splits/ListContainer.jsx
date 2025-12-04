//Based on: https://medium.com/@liadshiran92/easy-drag-and-drop-in-react-22778b30ba37
import React, { useState, useCallback } from 'react'
import { FileDownload } from './FileDownload.jsx'
import { FileUpload } from './FileUpload.jsx'
import { ItemList } from './ItemList.jsx'
import { OutputFileTime } from './OutputFileTime.jsx'
import { OutputSplitSettings } from './OutputSplitSettings.jsx'
import { defaultSetup, iconCache } from "../../utils/livesplit.js";
import '../../styles/style.css'

export const ListContainer = () => {
    
    //Shared states and variables
    const [files, setFiles] = useState([])
    const [unmaskPaths, setUnmaskPaths] = useState(false)
    const [uploadLabel, setUploadLabel] = useState("your")
    const [outputName, setOutputName] = useState("");
    const [finalOutput, setFinalOutput] = useState({name: "", data: ""});
    const [useFirstInfo, setUseFirstInfo] = useState(true)
    const [setupTime, setSetupTime] = useState(defaultSetup)
    const [customInfo, setCustomInfo] = useState({layout: "", offset: ""})
    const [templateText, setTemplateText] = useState({setup: "", final: ""})
    const [runName, setRunName] = useState({game: "", category: ""})
    const [toggleSettings, setToggleSettings] = useState(() => {
        const obj = {}
        for(let key of ["pb", "sob", "comp", "icon", "subs"]){
            obj[key] = true
        }
        return obj
    })
    const [requestData, setRequestData] = useState({game: [], category: []})
    const [selectedRequestedGame, setSelectedRequestedGame] = useState(null)

    //Status Boxes
    const initialStatus = {header: "", message: [""]}
    const [appStatuses, setAppStatuses] = useState(() => {
        const obj = {}
        for(let key of ["upload", "layout", "offset", "setup", "game", "category", "output", "download"]){
            obj[key] = initialStatus
        }
        return obj
    })
    const updateStatus = (key, data) => {
        setAppStatuses(appStatuses => {
            const updatedAppStatuses = {...appStatuses}
            updatedAppStatuses[key] = data
            return updatedAppStatuses
        })
    }
    const resetStatuses = () => {
        for(let key of Object.keys(appStatuses)){
            updateStatus(key, initialStatus)
        }
    }

    //Download checks
    const [canDownload, setCanDownload] = useState(() => {
        const obj = {}
        for(let key of ["layout", "offset", "setup", "output"]){
            obj[key] = true
        }
        return obj
    })
    const updateCanDownload = (key, value) => {
        setCanDownload(appStatuses => {
            const updatedCanDownload = {...appStatuses}
            updatedCanDownload[key] = value
            return updatedCanDownload
        })
    }
    
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

    //Reverse entries
    const reverseEntries = useCallback(
        () => {
            setFiles(files => {
                const updatedFiles = [...files]
                updatedFiles.reverse()
                for(let i = 0; i < updatedFiles.length; i++) {
                    updatedFiles[i].id = i+1;
                }
                return updatedFiles
            })
        },
        [files],
    )

    //Sort entries
    const sortEntries = useCallback(
        (reversed) => {
            setFiles(files => {
                const updatedFiles = [...files]
                const { compare } = Intl.Collator('en-US');
                updatedFiles.sort((a, b) => compare(a.runName, b.runName));
                if(reversed){
                    updatedFiles.reverse()
                }
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
                setFiles([])
                setUnmaskPaths(false)
                setUploadLabel("your")
                setOutputName("")
                setFinalOutput({name: "", data: ""})
                setUseFirstInfo(true)
                setSetupTime(defaultSetup)
                setCustomInfo({layout: "", offset: ""})
                setTemplateText({setup: "", final: ""})
                setRunName({game: "", category: ""})
                setToggleSettings(toggleSettings => {
                    const updatedToggleSettings = {...toggleSettings}
                    for(let key of Object.keys(updatedToggleSettings)){
                        updatedToggleSettings[key] = true
                    }
                    return updatedToggleSettings
                })
                setRequestData({game: [], category: []})
                setSelectedRequestedGame(null)
                setAppStatuses(appStatuses => {
                    const updatedAppStatuses = {...appStatuses}
                    for(let key of Object.keys(updatedAppStatuses)){
                        updatedAppStatuses[key] = initialStatus
                    }
                    return updatedAppStatuses
                })
                iconCache.length = 0
            }
        },
        [files],
    )

    return (
        <React.Fragment>

            {/* List operations */}
            <label id="unmask" title="Choose whether to unhide absolute filepath names for LiveSplit layouts">
                Unmask Filepaths: <input type="checkbox" htmlFor="unmask" checked={unmaskPaths} onChange={(e) => setUnmaskPaths(e.target.checked)}/>
            </label>
            <button type="button" onClick={resetStatuses} title="Closes any status box currently open on the webpage">
                Close All Status Boxes
            </button>
            <button type="button" onClick={resetApplication} title="Remove all entries and revert all settings to default">
                Reset Application
            </button>
            <FileUpload
                addListItem={addFileListItem}
                uploadLabel={uploadLabel}
                setUploadLabel={setUploadLabel}
                appStatuses={appStatuses}
                updateStatus={updateStatus}
                initialStatus={initialStatus}
            />

            {/* List entries */}
            <br/>
            <ItemList
                listItems={files}
                unmaskPaths={unmaskPaths}
                moveListItem={moveFileListItem}
                removeListItem={removeFileListItem}
                reverseEntries={reverseEntries}
                sortEntries={sortEntries}
            />

            {/* Output Settings */}
            <br/><br/>
            <OutputFileTime
                listItems={files}
                unmaskPaths={unmaskPaths}
                updateCanDownload={updateCanDownload}
                useFirstInfo={useFirstInfo}
                setUseFirstInfo={setUseFirstInfo}
                customInfo={customInfo}
                setCustomInfo={setCustomInfo}
                setupTime={setupTime}
                setSetupTime={setSetupTime}
                appStatuses={appStatuses}
                updateStatus={updateStatus}
                initialStatus={initialStatus}
            /><br/>
            <OutputSplitSettings
                listItems={files}
                toggleSettings={toggleSettings}
                setToggleSettings={setToggleSettings}
                templateText={templateText}
                setTemplateText={setTemplateText}
                runName={runName}
                setRunName={setRunName}
                requestData={requestData}
                setRequestData={setRequestData}
                selectedRequestedGame={selectedRequestedGame}
                setSelectedRequestedGame={setSelectedRequestedGame}
                appStatuses={appStatuses}
                updateStatus={updateStatus}
                initialStatus={initialStatus}
            /><br/>

            {/* Download merged contents */}
            <FileDownload
                listItems={files}
                unmaskPaths={unmaskPaths}
                canDownload={canDownload}
                updateCanDownload={updateCanDownload}
                outputName={outputName}
                setOutputName={setOutputName}
                finalOutput={finalOutput}
                setFinalOutput={setFinalOutput}
                runName={runName}
                appStatuses={appStatuses}
                updateStatus={updateStatus}
                initialStatus={initialStatus}
            />
        </React.Fragment>
    )
}