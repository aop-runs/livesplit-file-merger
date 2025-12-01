import React, { useRef, useState } from 'react'
import { StatusBox } from '../StatusBox.jsx'
import { isAValidFile, layoutExtension } from '../../utils/file.js'

export const OutputSettings = ({ listItems, unmaskPaths, useFirstInfo, setUseFirstInfo, customInfo, setCustomInfo, setupTime, setSetupTime, initialStatus }) => {
    
    //Status box tracking
    const [layoutStatus, setLayoutStatus] = useState(initialStatus);
    const [layoutValid, setLayoutValid] = useState(true);
    const [offsetStatus, setOffsetStatus] = useState(initialStatus);
    const [offsetValid, setOffsetValid] = useState(true);
    const [setupStatus, setSetupStatus] = useState(initialStatus);
    const [setupValid, setSetupValid] = useState(true);

    //Toggle whether to use custom layout and filepath or ones from the first LiveSplit file
    const toggleFirstInfo = (value) => {
        setUseFirstInfo(value)
        if(!value && listItems.length != 0){
            setCustomInfo({
                layout: listItems[0].layoutPath,
                offset: listItems[0].offset
            })
            setLayoutStatus({
                header: "Caution",
                message: ["Due to JavaScript restrictions, selecting another layout name through the file picker will assume the new layout is in the same directory as before. You can always copy & paste the full filepath of the new layout too."]
            })
        }
        else{
            setCustomInfo({
                layout: "",
                offset: ""
            })
            setLayoutStatus(initialStatus)
            setOffsetStatus(initialStatus)
        }
    }

    //Update custom layout path or offset
    const changeCustomSetting = (key, value) => {
        setCustomInfo(customInfo => {
            const updatedCustomInfo = {...customInfo}
            updatedCustomInfo[key] = value
            return updatedCustomInfo
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
        if(value.length != 0 && (hasInvalid || !isAValidFile(value, layoutExtension))){
            setLayoutValid(false)
            setLayoutStatus({
                header: "Error",
                message: [value + " is not a valid layout file"]
            })
        }
        else{
            setLayoutValid(true)
            setLayoutStatus(initialStatus)
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

        //Floating point is 7 decimal points long
        if(value.split(".").length > 1 && !hasInvalid){
            const temp = value.split(".")
            if(!temp[temp.length - 1].includes(":") && temp[temp.length - 1].length != 7){
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
            setOffsetValid(false)
            setOffsetStatus({
                header: "Error",
                message: [value + " is not a valid timer offset"]
            })
        }
        else{
            setOffsetValid(true)
            setOffsetStatus(initialStatus)
        }
    }

    //Update custom layout with the name of the file gathered from file picker
    const changeLayoutFile = (e) => {
        let splitPath = customInfo.layout.split("\\")
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
        setSetupTime(value)
        checkSetup(value)
    }

    //Check setup split time
    const checkSetup = (value) => {
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

        //Floating point is 7 decimal points long
        if(value.split(".").length > 1 && !hasInvalid){
            const temp = value.split(".")
            if(!temp[temp.length - 1].includes(":") && temp[temp.length - 1].length != 7){
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
        if(value.length != 0 && hasInvalid){
            setSetupValid(false)
            setSetupStatus({
                header: "Error",
                message: [value + " is not a valid setup split time"]
            })
        }
        else{
            setSetupValid(true)
            setSetupStatus(initialStatus)
        }
    }

    return (
            //Settings for output splits file
            <React.Fragment>
                
                {/* Custom Layout */}
                {(layoutStatus.header.length > 0 && !useFirstInfo) && <StatusBox
                    header={layoutStatus.header}
                    message={layoutStatus.message}
                    hideStatus={() => setLayoutStatus(initialStatus)}
                />}
                <label title="The layout LiveSplit will use for your output splits">
                    Starting Layout: {useFirstInfo && 
                        (listItems.length!=0 && listItems[0].layoutPath.length!=0 ? (unmaskPaths ? listItems[0].layoutPath : "*".repeat(listItems[0].layoutPath.length)) : "N/A")
                    }
                    {!useFirstInfo && 
                        <React.Fragment>
                            <input type={unmaskPaths ? "text" : "password" } disabled={listItems.length < 2} placeholder={"filepath\\filename.lsl"} value={customInfo.layout} onChange={(e) => changeCustomSetting("layout", e.target.value)}/>
                            <button type="button" disabled={customInfo.layout.length == 0} onClick={() => changeCustomSetting("layout", "")} title="Clear textfield for starting layout">
                                Clear Layout
                            </button>
                            <button type="button" disabled={customInfo.layout.length == 0} onClick={promptLayoutFile} title="Select another layout that exists in your current directory">
                                Select Another Layout
                            </button>
                            <input type="file" className = "layoutUpload" ref={layoutRef} value= "" accept={layoutExtension} onChange={changeLayoutFile} />
                        </React.Fragment>
                    }
                </label><br/>

                {/* Custom Offset */}
                {(offsetStatus.header.length > 0 && !useFirstInfo) && <StatusBox
                    header={offsetStatus.header}
                    message={offsetStatus.message}
                    hideStatus={() => setOffsetStatus(initialStatus)}
                />}
                <label title="The offset LiveSplit will use for your output splits">
                    Starting Offset: {useFirstInfo && 
                        (listItems.length!=0 ? listItems[0].offset : "N/A")
                    }
                    {!useFirstInfo && 
                        <React.Fragment>
                            <input type="text" disabled={listItems.length < 2} placeholder={"-0.00:00:00.0000000"} value={customInfo.offset} onChange={(e) => changeCustomSetting("offset", e.target.value)}/>
                            <button type="button" disabled={customInfo.offset.length == 0} onClick={() => changeCustomSetting("offset", "")} title="Clear textfield for starting offset">
                                Clear Offset
                            </button>
                        </React.Fragment>
                    }
                </label><br/>
                <label id="usefirst" title="Choose whether to use the first LiveSplit file's layout filepath and timer offset or custom specified ones">
                    Use Properties from First Entry: <input type="checkbox" htmlFor="unfirst" checked={useFirstInfo} onChange={(e) => toggleFirstInfo(e.target.checked)}/>
                </label><br/>

                {/* Setup Split Time */}
                {(setupStatus.header.length > 0 && listItems.length >= 2 && setupTime.length > 0) && <StatusBox
                    header={setupStatus.header}
                    message={setupStatus.message}
                    hideStatus={() => setSetupStatus(initialStatus)}
                />}
                <div title="The time allotted for setup splits for split calculations">
                    <label>Setup Split Time: </label>
                    <input type="text" disabled={listItems.length < 2} placeholder={"0.00:00:00.0000000"} value={setupTime} onChange={(e) => updateSetupTime(e.target.value)}/>
                    <button type="button" disabled={listItems.length < 2 || setupTime.length == 0} onClick={() => setSetupTime("")} title="Clear textfield for setup split time">
                        Clear Setup Split Time
                    </button>
                </div>
            </React.Fragment>
        )
    }