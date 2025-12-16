//Based on: https://medium.com/@liadshiran92/easy-drag-and-drop-in-react-22778b30ba37
import React, { useState, useCallback } from 'react'
import { FileDownload } from './FileDownload.jsx'
import { FileUpload } from './FileUpload.jsx'
import { ItemList } from './ItemList.jsx'
import { OutputFileTime } from './OutputFileTime.jsx'
import { OutputSplitSettings } from './OutputSplitSettings.jsx'
import { defaultSetup, defaultPBComp, iconCache } from "../../utils/livesplit.js";
import '../../styles/style.css'

export const ListContainer = () => {
    
    //Shared states and variables
    const [files, setFiles] = useState([])
    const [unmaskPaths, setUnmaskPaths] = useState(false)
    const [uploadLabel, setUploadLabel] = useState("your")
    const [requestData, setRequestData] = useState({game: [], category: [], selectedGame: null})
    const [finalOutput, setFinalOutput] = useState({name: "", data: ""})

    //Output settings for customizing splits
    const initializeSettings = () => {
        return {
            outputName: "",
            usedComparisons: [],
            setupTime: defaultSetup,
            gameComp: defaultPBComp,
            customInfo: {
                layout: null,
                offset: null
            },
            usedTimings: {
                realTime: true,
                gameTime: false
            },
            templateText: {
                setup: "",
                final: ""
            },
            runName: {
                game: "",
                category: ""
            },
            toggleSettings: {
                pb: true,
                sob: true,
                comp: true,
                icon: true,
                subs: true
            }
        }
    }
    const [outputSettings, setOutputSettings] = useState(initializeSettings())
    
    //Status Boxes
    const initialStatus = {header: "", message: [""]}
    const [appStatuses, setAppStatuses] = useState(() => {
        const obj = {}
        for(let key of ["upload", "layout", "offset", "setup", "comp", "game", "category", "output", "download"]){
            obj[key] = initialStatus
        }
        return obj
    })
    const updateStatus = (key, data = initialStatus) => {
        setAppStatuses(appStatuses => {
            const updatedAppStatuses = {...appStatuses}
            updatedAppStatuses[key] = data
            return updatedAppStatuses
        })
    }
    const resetStatuses = () => {
        for(let key of Object.keys(appStatuses)){
            updateStatus(key)
        }
    }

    //Download checks
    const [canDownload, setCanDownload] = useState(() => {
        const obj = {}
        for(let key of ["layout", "offset", "setup", "comp", "output"]){
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
    
    //Check game PB comparison name
    const checkGameComp = (settings) => {
        if(settings["gameComp"].length == 0){
            updateStatus("comp", {
                header: "Warning",
                message: ["No game PB comparison name provided"]
            })
            updateCanDownload("comp", false)
        }
        else if(settings["gameComp"] == "Personal Best"){
            updateStatus("comp", {
                header: "Error",
                message: ["Comparison cannot be named \'Personal Best\' as it's the default name for LiveSplit's PB comparison"]
            })
            updateCanDownload("comp", false)
        }
        else if(settings["usedComparisons"].findIndex(c => c.name === settings["gameComp"]) != -1){
            updateStatus("comp", {
                header: "Error",
                message: ["Comparison cannot be named after an existing comparison that will be carried over in your output splits"]
            })
            updateCanDownload("comp", false)
        }
        else{
            updateStatus("comp")
            updateCanDownload("comp", true)
        }
    }

    //Refresh all comparisons after list is modified
    const refreshComparisons = (files) => {
        setOutputSettings(outputSettings => {
            let updatedSettings = {...outputSettings}
            let searchedComp = []
            for(let file of Array.from(files).entries()){
                searchedComp = file[0] != 0 ? searchedComp.filter(name => file[1].comparisons.includes(name)) : [...file[1].comparisons]
            }
            updatedSettings["usedComparisons"] = searchedComp.map(
                (comp) => {
                    let nameIndex = outputSettings["usedComparisons"].findIndex(c => c.name === comp)
                    return {name: comp, used: outputSettings["usedComparisons"].findIndex(c => c.name === comp) != -1 ? outputSettings["usedComparisons"][nameIndex].used : true}
                }
            )
            checkGameComp(updatedSettings)
            return updatedSettings
        })
    }

    //Pre-included move function
    const moveFileListItem = useCallback(
        (dragIndex, hoverIndex) => {
            const dragItem = files[dragIndex]
            const hoverItem = files[hoverIndex]
            // Swap places of dragItem and hoverItem in the files array
            setFiles(files => {
                const updatedFiles = [...files]
                updatedFiles[dragIndex] = hoverItem
                updatedFiles[hoverIndex] = dragItem
                refreshComparisons(updatedFiles)
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
                refreshComparisons(updatedFiles)
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
                refreshComparisons(updatedFiles)
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
                refreshComparisons(updatedFiles)
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
                refreshComparisons(updatedFiles)
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
                setOutputSettings(initializeSettings())
                setFinalOutput({name: "", data: ""})
                setRequestData({game: [], category: [], selectedGame: null})
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
                <input type="checkbox" htmlFor="unmask" checked={unmaskPaths} onChange={(e) => setUnmaskPaths(e.target.checked)}/>
                Unmask Filepaths
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
                outputSettings={outputSettings}
                setOutputSettings={setOutputSettings}
                checkGameComp={checkGameComp}
                appStatuses={appStatuses}
                updateStatus={updateStatus}
            /><br/>
            <OutputSplitSettings
                listItems={files}
                updateCanDownload={updateCanDownload}
                outputSettings={outputSettings}
                setOutputSettings={setOutputSettings}
                requestData={requestData}
                setRequestData={setRequestData}
                appStatuses={appStatuses}
                updateStatus={updateStatus}
            /><br/>

            {/* Download merged contents */}
            <FileDownload
                listItems={files}
                unmaskPaths={unmaskPaths}
                canDownload={canDownload}
                updateCanDownload={updateCanDownload}
                outputSettings={outputSettings}
                setOutputSettings={setOutputSettings}
                finalOutput={finalOutput}
                setFinalOutput={setFinalOutput}
                appStatuses={appStatuses}
                updateStatus={updateStatus}
            />
        </React.Fragment>
    )
}