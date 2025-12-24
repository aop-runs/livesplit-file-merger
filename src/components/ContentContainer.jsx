import React, { useState, useCallback } from 'react'
import { FileDownload } from './Splits/FileDownload.jsx'
import { FileUpload } from './Splits/FileUpload.jsx'
import { ItemList } from './Splits/ItemList.jsx'
import { OutputSettings } from './Splits/OutputSettings.jsx'
import { MdOutlineResetTv } from "react-icons/md";
import { defaultSetup, defaultPBComp, iconCache } from "../utils/livesplit.js";
import '../styles/style.scss'

export const ContentContainer = () => {
    
    //Shared states and variables
    const [files, setFiles] = useState([])
    const [unmaskPaths, setUnmaskPaths] = useState(false)
    const [requestData, setRequestData] = useState({game: [], category: [], selectedGame: null, selectedCategory: null})
    const [finalOutput, setFinalOutput] = useState({filename: "", output: {name: "", data: ""}})

    //Output settings for customizing splits
    const initializeSettings = () => {
        return {
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
            runMetadata: {
                region: "",
                platform: "",
                variables: []
            },
            toggleSettings: {
                pb: true,
                sob: true,
                comp: true,
                icon: true,
                subs: true,
                emu: false
            }
        }
    }
    const [outputSettings, setOutputSettings] = useState(initializeSettings())
    
    //Status Boxes
    const initialStatus = {header: "", message: [""]}
    const [appStatuses, setAppStatuses] = useState(() => {
        const obj = {}
        for(let key of ["upload", "layout", "offset", "setup", "found", "comp", "game", "category", "output", "download"]){
            if(key == "upload"){
                obj[key] = {
                    header: "Info",
                    message: ["Upload some split files below to get started"]
                }
            }
            else{
                obj[key] = initialStatus
            }
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
            if(key == "upload"){
                updateStatus("upload", {
                    header: "Info",
                    message: ["Upload some split files below to get started"]
                })
            }
            else{
                updateStatus(key)
            }
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
        setCanDownload(canDownload => {
            const updatedCanDownload = {...canDownload}
            updatedCanDownload[key] = value
            return updatedCanDownload
        })
    }
    const resetCanDownload = () => {
        for(let key of Object.keys(canDownload)){
            updateCanDownload(key, true)
        }
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
        else{
            let locatedIndex = settings["usedComparisons"].findIndex(c => c.name === settings["gameComp"])
            if(settings["toggleSettings"].comp && (locatedIndex != -1 && settings["usedComparisons"][locatedIndex].used)){
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
    }

    //Refresh all comparisons after list is modified
    const refreshComparisons = (files) => {
        setOutputSettings(outputSettings => {
            let updatedSettings = {...outputSettings}
            let searchedComp = []
            for(let file of Array.from(files).entries()){
                searchedComp = file[0] != 0 ? searchedComp.filter(name => file[1].comparisons.includes(name)) : [...file[1].comparisons]
            }
            updatedSettings["usedComparisons"] = searchedComp.filter(name => name != defaultPBComp).map(
                (comp) => {
                    let nameIndex = outputSettings["usedComparisons"].findIndex(c => c.name === comp)
                    return {name: comp, used: outputSettings["usedComparisons"].findIndex(c => c.name === comp) != -1 ? outputSettings["usedComparisons"][nameIndex].used : true}
                }
            )
            checkGameComp(updatedSettings)
            if(updatedSettings["usedComparisons"].length == 0 && files.length != 0){
                updateStatus("found", {
                    header: "Info",
                    message: ["No comparisons found that exist in each entry"]
                })
            }
            else{
                updateStatus("found")
            }
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
                setOutputSettings(initializeSettings())
                setFinalOutput({filename: "", output: {name: "", data: ""}})
                setRequestData({game: [], category: [], selectedGame: null, selectedCategory: null})
                resetStatuses()
                resetCanDownload()
                iconCache.length = 0
            }
        },
        [files],
    )

    return (
        <React.Fragment>

            {/* Upload Files */}
            <div className="flex-container">
                <div className="flex-item flex-item-1">
                    {/* Application Settings */}
                    <details open title="Click to open/close this section">
                        <summary className="sectionTitle">
                            Application Settings
                        </summary>
                        <label id="unmask" title="Choose whether to unhide absolute filepath names for LiveSplit layouts">
                            <input type="checkbox" htmlFor="unmask" checked={unmaskPaths} onChange={(e) => setUnmaskPaths(e.target.checked)}/>
                            Unmask Filepaths
                        </label>
                        <button className="reset-button" type="button" onClick={resetApplication} title="Remove all entries and revert all settings to default">
                            <MdOutlineResetTv />
                        </button>
                        <br/>
                    </details>
                    <br/>
                    <FileUpload
                        addListItem={addFileListItem}
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
                    <br/>
                    <FileDownload
                        listItems={files}
                        unmaskPaths={unmaskPaths}
                        outputSettings={outputSettings}
                        canDownload={canDownload}
                        updateCanDownload={updateCanDownload}
                        finalOutput={finalOutput}
                        setFinalOutput={setFinalOutput}
                        appStatuses={appStatuses}
                        updateStatus={updateStatus}
                    />
                    <br/>
                    <a className = "top-link" href = "#top" title="Click to go back to the top of the webpage">
                        Back to Top
                    </a>
                </div>

                {/* Download merged contents */}
                <div className="flex-item flex-item-2">
                    {/* Output Settings */}
                    <OutputSettings
                        listItems={files}
                        unmaskPaths={unmaskPaths}
                        updateCanDownload={updateCanDownload}
                        outputSettings={outputSettings}
                        setOutputSettings={setOutputSettings}
                        requestData={requestData}
                        setRequestData={setRequestData}
                        checkGameComp={checkGameComp}
                        appStatuses={appStatuses}
                        updateStatus={updateStatus}
                    />
                    <br/>
                    <a className = "top-link" href = "#top" title="Click to go back to the top of the webpage">
                        Back to Top
                    </a>
                </div>
            </div>
        </React.Fragment>
    )
}