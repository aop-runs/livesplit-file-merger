import React, { useState, useEffect, useCallback } from 'react'
import { SettingsColumn } from './Settings/SettingsColumn.jsx'
import { SplitsColumn } from './Splits/SplitsColumn.jsx'
import { defaultSetup, defaultPBComp, iconCache } from "../utils/livesplit.js";
import '../styles/style.scss'

export const ContentContainer = () => {
    
    //Shared states and variables
    const [files, setFiles] = useState([])
    const [unmaskPaths, setUnmaskPaths] = useState(false)
    const [requestData, setRequestData] = useState({game: [], category: [], selectedGame: null, selectedCategory: null})
    const [finalOutput, setFinalOutput] = useState({filename: "", output: {name: "", data: "", current: false, timestamp: ""}})

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
                emu: false,
                variables: []
            },
            toggleSettings: {
                pb: true,
                sob: true,
                comp: true,
                icon: true,
                subs: true,
                full: true,
            }
        }
    }
    const [outputSettings, setOutputSettings] = useState(initializeSettings())
    
    //Detect if splits are changed after editing and prompt user if an output file exists
    useEffect(() => {
        setFinalOutput(finalOutput => {
            const updatedFinalOutput = {...finalOutput}
            updatedFinalOutput["output"]["current"] = false
            if(updatedFinalOutput["output"]["name"].length != 0){
                updateStatus("download", {
                    header: "Info",
                    message: ["You have since modified your split entries and/or settings since you last generated output splits. If you like to use these changes, please click the above button to regenerate output splits."]
                })
            }
            return updatedFinalOutput
        })
    }, [outputSettings])

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
            <div className="flex-container">
                <div className="flex-item flex-item-1">
                    <SplitsColumn
                        listItems={files}
                        setListItems={setFiles}
                        unmaskPaths={unmaskPaths}
                        setUnmaskPaths={setUnmaskPaths}
                        resetApplication={resetApplication}
                        outputSettings={outputSettings}
                        setOutputSettings={setOutputSettings}
                        canDownload={canDownload}
                        updateCanDownload={updateCanDownload}
                        finalOutput={finalOutput}
                        setFinalOutput={setFinalOutput}
                        checkGameComp={checkGameComp}
                        appStatuses={appStatuses}
                        updateStatus={updateStatus}
                    />
                </div>
                <div className="flex-item flex-item-2">
                    <SettingsColumn
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
                </div>
            </div>
        </React.Fragment>
    )
}