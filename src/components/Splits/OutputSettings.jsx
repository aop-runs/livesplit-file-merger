import React, { useRef, useState } from 'react'
import { StatusBox } from '../StatusBox.jsx'
import { isAValidFile, layoutExtension } from '../../utils/file.js'

export const OutputSettings = ({ listItems, unmaskPaths, useFirstInfo, setUseFirstInfo, customInfo, setCustomInfo, initialStatus }) => {
    
    //Status box tracking
    const [layoutStatus, setLayoutStatus] = useState(initialStatus);
    const [layoutValid, setLayoutValid] = useState(true);

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
    }
    const checkLayout = (value) => {
        //No unsupported filename characters
        let hasInvalid = false
        for(let char of ["<", ">", "\"", "'", "/", "|", "?", "*", "&"]) {
            if(value.includes(char)){
                hasInvalid = true
                break
            }
        }
        
        //Extension is relevant if provided
        if(hasInvalid || !isAValidFile(value, layoutExtension)){
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
                            <input type={unmaskPaths ? "text" : "password" } disabled={listItems.length < 2} placeholder={"layout"} value={customInfo.layout} onChange={(e) => changeCustomSetting("layout", e.target.value)}/>
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
                <label title="The offset LiveSplit will use for your output splits">
                    Starting Offset: {useFirstInfo && 
                        (listItems.length!=0 ? listItems[0].offset : "N/A")
                    }
                    {!useFirstInfo && 
                        <React.Fragment>
                            <input type="text" disabled={listItems.length < 2} placeholder={"offset"} value={customInfo.offset} onChange={(e) => changeCustomSetting("offset", e.target.value)}/>
                            <button type="button" disabled={customInfo.offset.length == 0} onClick={() => changeCustomSetting("offset", "")} title="Clear textfield for starting offset">
                                Clear Offset
                            </button>
                        </React.Fragment>
                    }
                </label><br/>
                <label id="usefirst" title="Choose whether to use the first LiveSplit file's layout filepath and timer offset or custom specified ones">
                    Use Properties from First Entry: <input type="checkbox" htmlFor="unfirst" checked={useFirstInfo} onChange={(e) => toggleFirstInfo(e.target.checked)}/>
                </label><br/>
                
            </React.Fragment>
        )
    }