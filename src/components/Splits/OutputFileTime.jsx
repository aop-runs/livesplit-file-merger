//Based on: https://medium.com/@aren.talb00/creating-a-custom-file-input-using-react-and-useref-233f5d4abfc9
import React, { useRef } from 'react'
import { StatusBox } from '../StatusBox.jsx'
import { isAValidFile, layoutExtension } from '../../utils/file.js'
import { defaultSetup, defaultPBComp, timeToSeconds } from "../../utils/livesplit.js";

export const OutputFileTime = ({ listItems, unmaskPaths, updateCanDownload, outputSettings, setOutputSettings, checkGameComp, appStatuses, updateStatus }) => {
    
    //Toggle whether selected comparison should be carried over to output file
    const toggleComparison = (index, value) => {
        setOutputSettings(outputSettings => {
            const updatedSettings = {...outputSettings}
            updatedSettings["usedComparisons"][index].used = value
            return updatedSettings
        })
    }
    const toggleAllComparisons = (value) => {
        for(let i = 0; i < outputSettings["usedComparisons"].length; i++){
            toggleComparison(i, value)
        }
    }

    //Toggle whether to use custom layout and filepath or ones from the first LiveSplit file
    const toggleFirstInfo = (value) => {
        if(!value && listItems.length != 0){
            setOutputSettings(outputSettings => {
                const updatedSettings = {...outputSettings}
                updatedSettings["customInfo"].layout = listItems[0].layoutPath
                updatedSettings["customInfo"].offset = listItems[0].offset
                return updatedSettings
            })
            updateStatus("layout", {
                header: "Caution",
                message: ["Due to JavaScript restrictions, selecting another layout name through the file picker will assume the new layout is in the same directory as before. You can always copy & paste the full filepath of the new layout too."]
            })
        }
        else{
            setOutputSettings(outputSettings => {
                const updatedSettings = {...outputSettings}
                updatedSettings["customInfo"].layout = null
                updatedSettings["customInfo"].offset = null
                return updatedSettings
            })
            updateStatus("layout")
            updateStatus("offset")
        }
    }

    //Update custom layout path or offset
    const changeCustomSetting = (key, value) => {
        setOutputSettings(outputSettings => {
            const updatedSettings = {...outputSettings}
            updatedSettings["customInfo"][key] = value
            return updatedSettings
        })
        if(key == "layout"){
            checkLayout(value)
        }
        else if(key == "offset"){
            checkOffset(value)
        }
    }
    const checkLayout = (value) => {
        //No unsupported layout path characters
        let hasInvalid = false
        for(let char of ["<", ">", "\"", "'", "/", "|", "?", "*", "&"]) {
            if(value.includes(char)){
                hasInvalid = true
                break
            }
        }
        
        //Extension is relevant if provided
        if(value.length != 0 && (hasInvalid || value == layoutExtension || !isAValidFile(value, layoutExtension))){
            updateStatus("layout", {
                header: "Error",
                message: [value + " is not a valid layout file"]
            })
            updateCanDownload("layout", false)
        }
        else{
            updateStatus("layout")
            updateCanDownload("layout", true)
        }
    }
    const checkOffset = (value) => {
        
        //If first character can be a negative sign, otherwise a number
        let hasInvalid = false
        if(!["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-"].includes(value.charAt(0))){
            hasInvalid = true
        }
        if(value.charAt(0) == "-" && !["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(value.charAt(1))){
            hasInvalid = true
        }

        //Right amount of specific characters
        if(value.split(":").length != 3 || value.split(".").length > 3 || value.includes("::") || value.includes("..")){
            hasInvalid = true
        }

        //Rest of the string has no invalid characters
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
            const temp = value.slice(value.charAt(0) == "-" ? 1 : 0).split(":")
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
        if(value.length != 0 && hasInvalid){
            updateStatus("offset", {
                header: "Error",
                message: [value + " is not a valid timer offset"]
            })
            updateCanDownload("offset", false)
        }
        else{
            updateStatus("offset")
            updateCanDownload("offset", true)
        }
    }

    //Update custom layout with the name of the file gathered from file picker
    const changeLayoutFile = (e) => {
        let splitPath = outputSettings["customInfo"].layout.split("\\")
        splitPath[splitPath.length - 1] = e.target.files[0].name
        let finalPath = splitPath.join("\\")
        changeCustomSetting("layout", finalPath)
        checkLayout(finalPath)
    }

    //Prompt for custom layout name
    const layoutRef = useRef(null)
    const promptLayoutFile = (e) => {
        layoutRef.current.click()
    }

    //Update setup split time
    const updateSetupTime = (value) => {
        setOutputSettings(outputSettings => {
            const updatedSettings = {...outputSettings}
            updatedSettings["setupTime"] = value
            return updatedSettings
        })
        checkSetup(value)
    }

    //Check setup split time
    const checkSetup = (value) => {
        if(value.length == 0){
            updateStatus("setup", {
                header: "Warning",
                message: ["No setup split time provided"]
            })
            updateCanDownload("setup", false)
            return
        }
        
        //If first is a number
        let hasInvalid = false
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

        //Time provided is not 0
        if(!hasInvalid && timeToSeconds(value) == 0){
            hasInvalid = true
        }

        if(hasInvalid){
            updateStatus("setup", {
                header: "Error",
                message: [value + " is not a valid setup split time"]
            })
            updateCanDownload("setup", false)
        }
        else{
            updateStatus("setup")
            updateCanDownload("setup", true)
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

    return (
            //Settings for output layout, offset, and setup split times
            <React.Fragment>
                
                {/* Comparisons Present in Each Item */}
                {outputSettings["toggleSettings"]["comp"] && 
                <React.Fragment>
                    {outputSettings["usedComparisons"].length != 0 &&
                        <label title="Comparisons present in every file that can be toggled whether they can be carried over to your output splits">
                            {outputSettings["usedComparisons"].map((comp, index) => {
                                return (
                                    <label id={comp.name} key={index}>
                                        <input type="checkbox" disabled={listItems.length < 2} htmlFor={comp.name} checked={comp.used} onChange={(e) => toggleComparison(index, e.target.checked)}/>
                                        Carry over {comp.name} Comparison<br/>
                                    </label>
                                );
                            })}
                        </label>
                    }
                    {outputSettings["usedComparisons"].length == 0 &&
                        <label title="Label for no comparisons found that can be carried over to your output splits">
                            No comparisons found that exist in each entry<br/>
                        </label>
                    }
                    <button type="button" disabled={listItems.length < 2 || (Array.from(new Set(outputSettings["usedComparisons"].map((comp) => {return comp.used})))[0] == true && new Set(outputSettings["usedComparisons"].map((comp) => {return comp.used})).size == 1)} onClick={() => toggleAllComparisons(true)} title="Toogle all above comparison settings on">
                        Toggle All Comparisons On
                    </button>
                    <button type="button" disabled={listItems.length < 2 || (Array.from(new Set(outputSettings["usedComparisons"].map((comp) => {return comp.used})))[0] == false && new Set(outputSettings["usedComparisons"].map((comp) => {return comp.used})).size == 1)} onClick={() => toggleAllComparisons(false)} title="Toogle all above comparison settings off">
                        Toggle All Comparisons Off
                    </button>
                    <br/><br/>
                </React.Fragment>
                }

                {/* Custom Layout */}
                {(appStatuses.layout.header.length > 0) && <StatusBox
                    header={appStatuses.layout.header}
                    message={appStatuses.layout.message}
                    hideStatus={() => updateStatus("layout")}
                />}
                <label title="The layout LiveSplit will use for your output splits">
                    Starting Layout: {(outputSettings["customInfo"].layout == null && outputSettings["customInfo"].offset == null) && 
                        (listItems.length!=0 && listItems[0].layoutPath.length!=0 ? (unmaskPaths ? listItems[0].layoutPath : "*".repeat(listItems[0].layoutPath.length)) : "N/A")
                    }
                    {(outputSettings["customInfo"].layout != null && outputSettings["customInfo"].offset != null) && 
                        <React.Fragment>
                            <input type={unmaskPaths ? "text" : "password" } disabled={listItems.length < 2} placeholder={"filepath\\filename.lsl"} value={outputSettings["customInfo"].layout} onChange={(e) => changeCustomSetting("layout", e.target.value)}/>
                            <button type="button" disabled={outputSettings["customInfo"].layout.length == 0} onClick={() => changeCustomSetting("layout", "")} title="Clear textfield for starting layout">
                                Clear Layout
                            </button>
                            <button type="button" disabled={outputSettings["customInfo"].layout.length == 0} onClick={promptLayoutFile} title="Select another layout that exists in your current directory">
                                Select Another Layout
                            </button>
                            <input type="file" className = "layoutUpload" ref={layoutRef} value= "" accept={layoutExtension} onChange={changeLayoutFile} />
                        </React.Fragment>
                    }
                </label><br/>

                {/* Custom Offset */}
                {(appStatuses.offset.header.length > 0) && <StatusBox
                    header={appStatuses.offset.header}
                    message={appStatuses.offset.message}
                    hideStatus={() => updateStatus("offset")}
                />}
                <label title="The offset LiveSplit will use for your output splits">
                    Starting Offset: {(outputSettings["customInfo"].layout == null && outputSettings["customInfo"].offset == null) && 
                        (listItems.length!=0 ? listItems[0].offset : "N/A")
                    }
                    {(outputSettings["customInfo"].layout != null && outputSettings["customInfo"].offset != null) && 
                        <React.Fragment>
                            <input type="text" disabled={listItems.length < 2} placeholder={"-0.00:00:00.0000000"} value={outputSettings["customInfo"].offset} onChange={(e) => changeCustomSetting("offset", e.target.value)}/>
                            <button type="button" disabled={outputSettings["customInfo"].offset.length == 0} onClick={() => changeCustomSetting("offset", "")} title="Clear textfield for starting offset">
                                Clear Offset
                            </button>
                        </React.Fragment>
                    }
                </label><br/>
                <label id="usefirst" title="Choose whether to use the first LiveSplit file's layout filepath and timer offset or custom specified ones">
                    <input type="checkbox" disabled={listItems.length < 2} htmlFor="unfirst" checked={(outputSettings["customInfo"].layout == null && outputSettings["customInfo"].offset == null)} onChange={(e) => toggleFirstInfo(e.target.checked)}/>
                    Use Properties from First Entry
                </label><br/>

                {/* Setup Split Time */}
                {(appStatuses.setup.header.length > 0) && <StatusBox
                    header={appStatuses.setup.header}
                    message={appStatuses.setup.message}
                    hideStatus={() => updateStatus("setup")}
                />}
                <div title="The time allotted for setup splits for split calculations">
                    <label>Setup Split Time: </label>
                    <input type="text" disabled={listItems.length < 2} placeholder={"0.00:00:00.0000000"} value={outputSettings["setupTime"]} onChange={(e) => updateSetupTime(e.target.value)}/>
                    <button type="button" disabled={listItems.length < 2 || outputSettings["setupTime"].length == 0} onClick={() => updateSetupTime("")} title="Clear textfield for setup split time">
                        Clear Setup Split Time
                    </button>
                    <button type="button" disabled={listItems.length < 2} onClick={() => updateSetupTime(defaultSetup)} title="Revert back to default setup split time">
                        Use Default Setup Time
                    </button>
                </div>

                {/* Game Comparison Name */}
                {outputSettings["toggleSettings"]["pb"] && 
                    <React.Fragment>
                    {(appStatuses.comp.header.length > 0) && <StatusBox
                        header={appStatuses.comp.header}
                        message={appStatuses.comp.message}
                        hideStatus={() => updateStatus("comp")}
                    />}
                    <div title="The name of the comparison for current game PBs">
                        <label>Game PB Comparison Name: </label>
                        <input type="text" disabled={listItems.length < 2} placeholder={"Comparison Name"} value={outputSettings["gameComp"]} onChange={(e) => updateComparisonName(e.target.value)}/>
                        <button type="button" disabled={listItems.length < 2 || outputSettings["gameComp"].length == 0} onClick={() => updateComparisonName("")} title="Clear textfield for game PB comparison name">
                            Clear Comparison Name
                        </button>
                        <button type="button" disabled={listItems.length < 2} onClick={() => updateComparisonName(defaultPBComp)} title="Revert back to default game PB comparison name">
                            Use Default Comparison Name
                        </button>
                    </div>
                    </React.Fragment>
                }
            </React.Fragment>
        )
    }