import React from 'react'
import { StatusPopUp } from '../Inputs/StatusPopUp.jsx'
import { TextField } from '../Inputs/TextField.jsx'
import { defaultSetup, defaultPBComp, timeToSeconds } from "../../utils/livesplit.js";
import '../../styles/style.scss'

export const OutputOptions = ({ listItems, setListItems, canDownload, updateCanDownload, outputSettings, setOutputSettings, checkGameComp, appStatuses, updateStatus }) => {

    //Update setup split time
    const updateSetupSplit = (value) => {
        setOutputSettings(outputSettings => {
            const updatedSettings = {...outputSettings}
            updatedSettings["setupTime"] = value
            return updatedSettings
        })
        checkSetup(value)
    }

    //Update each entry's setup split time 
    const updateSelectedEntry = (value) => {
        if(value != ""){
            setOutputSettings(outputSettings => {
                const updatedSettings = {...outputSettings}
                updatedSettings["setupTime"] = listItems[value].setup
                updatedSettings["entryIndex"] = value
                return updatedSettings
            })
        } 
    }
    const updateAllSetupTimes = (value) => {
        for(let i = 0; i < listItems.length; i++){
            updateSetupTimeAt(i, value)
        }
    }
    const updateSetupTimeAt = (index, value) => {
        setListItems(listItems => {
            const updatedFiles = [...listItems]
            updatedFiles[index].setup = value
            return updatedFiles
        })
    }

    //Check setup split time
    const checkSetup = (value) => {
        
        //If first is a number
        let hasInvalid = false
        if(value.length != 0){
            if(!["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(value.charAt(0))){
                hasInvalid = true
            }
            
            //Right amount of specific characters
            if(value.split(":").length != 3 || value.split(".").length > 3 || value.includes("::") || value.includes("..")){
                hasInvalid = true
            }

            //All of the string has no invalid characters
            for(let char of value.slice(1)){
                if(!["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", ":"].includes(char)){
                    hasInvalid = true
                    break
                }
            }

            //Floating point is no more than 7 decimal points long
            if(value.split(".").length > 1 && !hasInvalid){
                const temp = value.split(".")
                if(!temp[temp.length - 1].includes(":") && (temp[temp.length - 1].length > 7 || temp[temp.length - 1].length == 0)){
                    hasInvalid = true
                }
            }

            //Valid time values present
            if(value.split(":").length == 3 && !hasInvalid){
                const temp = value.split(":")
                if(temp[0].includes(".")){
                    temp[0] = temp[0].split(".")[1]
                }
                if(temp[2].includes(".")){
                    temp[2] = temp[2].split(".")[0]
                }
                if((temp[0].length != 2 || parseInt(temp[0]) > 23) || (temp[1].length != 2 || parseInt(temp[1]) > 59) || (temp[2].length != 2 || parseInt(temp[2]) > 59)){
                    hasInvalid = true
                }
            }
        }
        if(hasInvalid){
            updateStatus("setup", {
                header: "Error",
                message: [value + " is not a valid setup split time"]
            })
            updateCanDownload("setup", false)
            return
        }

        //Update setup time for all files or just specified file
        updateCanDownload("setup", true)
        if(value.length == 0 || timeToSeconds(value) == 0){
            updateStatus("setup", {
                header: "Warning",
                message: ["Not providing a setup split time will prevent creating " + (outputSettings.entryIndex != "" ? "a setup split for any game without one" : "setup splits before each run") + " when generating your output splits"]
            })
        }
        else{
            updateStatus("setup")
        }
        if(outputSettings.entryIndex != ""){
            updateSetupTimeAt(outputSettings.entryIndex, value)
        }
        else{
            updateAllSetupTimes(value)
        }
    }

    //Update game PB comparison name
    const updateComparisonName = (value) => {
        setOutputSettings(outputSettings => {
            const updatedSettings = {...outputSettings}
            updatedSettings["gameComp"] = value
            checkGameComp(updatedSettings)
            return updatedSettings
        })
    }

    //Toggle checkbox
    const toggleCheckbox = (key, value) => {
        setOutputSettings(outputSettings => {
            const updatedSettings = {...outputSettings}
            updatedSettings["toggleSettings"][key] = value
            return updatedSettings
        })
        if(key == "pb" && !value){
            setOutputSettings(outputSettings => {
                const updatedSettings = {...outputSettings}
                updatedSettings["gameComp"] = defaultPBComp
                return updatedSettings
            })
            updateStatus("comp")
            updateCanDownload("comp", true)
        }
        if(key == "full"){
            setOutputSettings(outputSettings => {
                const updatedSettings = {...outputSettings}
                updatedSettings["templateText"]["final"] = ""
                updatedSettings["toggleSettings"]["subs"] = true
                return updatedSettings
            })
        }
        if(key == "same" && value){
            updateSetupSplit(defaultSetup)
            updateAllSetupTimes(defaultSetup)
            setOutputSettings(outputSettings => {
                const updatedSettings = {...outputSettings}
                updatedSettings["entryIndex"] = ""
                return updatedSettings
            })
        }
        else if(key == "same" && !value){
            if(!canDownload["setup"]){
                updateSetupSplit(defaultSetup)
            }
            setOutputSettings(outputSettings => {
                const updatedSettings = {...outputSettings}
                updatedSettings["entryIndex"] = 1
                return updatedSettings
            })
        }
    }

    return (
    
        <React.Fragment>

            {/* Split Settings */}
            <details title="Click to open/close this section">
                <summary className ="sectionTitle">
                    Output Options
                </summary>
                <label id="fullbox" title="Choose whether to use every split from a game or only use one game specific split per game">
                    <input type="checkbox" disabled={listItems.length < 2} htmlFor="fullbox" checked={outputSettings["toggleSettings"]["full"]} onChange={(e) => toggleCheckbox("full", e.target.checked)}/>
                    Use Full Game Splits
                </label><br/>
                <label id="iconbox" title="Choose whether to carry over segment icons from your splits files">
                    <input type="checkbox" disabled={listItems.length < 2} htmlFor="iconbox" checked={outputSettings["toggleSettings"]["icon"]} onChange={(e) => toggleCheckbox("icon", e.target.checked)}/>
                    Carry Over Segment Icons
                </label><br/>
                <label id="sobbox" title="Choose whether to carry over your sum of best segments from your split files">
                    <input type="checkbox" disabled={listItems.length < 2} htmlFor="sobbox" checked={outputSettings["toggleSettings"]["sob"]} onChange={(e) => toggleCheckbox("sob", e.target.checked)}/>
                    Carry Over Sum of Best Times
                </label><br/>
                <label id="pbbox" title="Choose whether to carry over your pbs from your split files as a new comparison">
                    <input type="checkbox" disabled={listItems.length < 2} htmlFor="pbbox" checked={outputSettings["toggleSettings"]["pb"]} onChange={(e) => toggleCheckbox("pb", e.target.checked)}/>
                    Carry Over PBs
                </label><br/><br/>

                {/* Game Comparison Name */}
                {outputSettings["toggleSettings"]["pb"] && 
                    <React.Fragment>
                    {(appStatuses.comp.header.length > 0) && <StatusPopUp
                        header={appStatuses.comp.header}
                        message={appStatuses.comp.message}
                    />}
                    <TextField
                        title={"Game PB Comparison Name"}
                        unmaskCon={true}
                        moveCursorToEnd={false}
                        disableCon={listItems.length < 2}
                        placeholderText={"Comparison Name"}
                        changeableValue={listItems.length >= 2 ? outputSettings["gameComp"] : ""}
                        updateFunction={updateComparisonName}
                        description={"The name of the comparison for current game PBs"}
                        defaultButton={{
                            value: defaultPBComp,
                            description: "Revert back to default game PB comparison name"
                        }}
                    />
                    <br/>
                    </React.Fragment>
                }
                {/* Setup Split Time */}
                {(appStatuses.setup.header.length > 0) && <StatusPopUp
                    header={appStatuses.setup.header}
                    message={appStatuses.setup.message}
                />}
                <label id="samebox" title="Choose whether to use the same split times for setting up the next run for each entry">
                    <input type="checkbox" disabled={listItems.length < 2} htmlFor="samebox" checked={outputSettings["toggleSettings"]["same"]} onChange={(e) => toggleCheckbox("same", e.target.checked)}/>
                    Use Same Setup Split for All Entries
                </label><br/>
                {outputSettings["toggleSettings"]["same"] && 
                    <TextField
                        title={"Setup Split Time"}
                        unmaskCon={true}
                        moveCursorToEnd={false}
                        disableCon={listItems.length < 2}
                        placeholderText={"0.00:00:00.0000000"}
                        changeableValue={listItems.length >= 2 ? outputSettings["setupTime"] : ""}
                        updateFunction={updateSetupSplit}
                        description={"The time allotted for all setup splits for split calculations"}
                        defaultButton={{
                            value: defaultSetup,
                            description: "Revert back to default setup split time"
                        }}
                    />
                }
                {!outputSettings["toggleSettings"]["same"] && 
                    <TextField
                        title={"Setup Split Time"}
                        unmaskCon={true}
                        moveCursorToEnd={false}
                        disableCon={listItems.length < 2}
                        placeholderText={"0.00:00:00.0000000"}
                        changeableValue={listItems.length >= 2 ? outputSettings["setupTime"] : ""}
                        updateFunction={updateSetupSplit}
                        description={"The time allotted for this entry's setup split for split calculations"}
                        defaultButton={{
                            value: defaultSetup,
                            description: "Revert back to default setup split time"
                        }}
                        dropDown={{
                            title: "Change Split Entry",
                            setValue: outputSettings["entryIndex"],
                            disableCon: listItems.length < 2 || !canDownload["setup"],
                            updateFunction: updateSelectedEntry,
                            canClickToRefresh: false,
                            description: "Change split entry to modify setup split times for",
                            choices: listItems.map((entry, index) => {
                                return (
                                    <option key={index} value={index}>
                                        {entry.runName + (entry.initialRepeats != 0 ? " (" + entry.initialRepeats.toString() + ")" : "")}
                                    </option>
                                );
                            })
                        }}
                    />
                }
            </details>

        </React.Fragment>

    )

}