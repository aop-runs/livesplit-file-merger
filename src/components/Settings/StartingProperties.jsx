//Based on: https://medium.com/@aren.talb00/creating-a-custom-file-input-using-react-and-useref-233f5d4abfc9
import React, { useRef } from 'react'
import { StatusPopUp } from '../Inputs/StatusPopUp.jsx'
import { TextField } from '../Inputs/TextField.jsx'
import { LiaFileUploadSolid } from "react-icons/lia";
import { isAValidFile, layoutExtension } from '../../utils/file.js'
import '../../styles/style.scss'

export const StartingProperties = ({ listItems, unmaskPaths, updateCanDownload, outputSettings, setOutputSettings, appStatuses, updateStatus }) => {
    
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
                header: "Info",
                message: ["Due to JavaScript restrictions, selecting another layout name through the file picker will assume the new layout is in the same directory as before. You can always copy & paste the full filepath of the new layout too"]
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
        if(outputSettings["customInfo"].layout.length != 0){
            layoutRef.current.click()
        }
    }

    return (
    
        <React.Fragment>

            {/* Starting Properties */}
            <details title="Click to open/close this section">
                <summary className ="sectionTitle">
                    Starting Properties
                </summary>
                <label id="usefirst" title="Choose whether to use the first LiveSplit file's layout filepath and timer offset or custom specified ones">
                    <input type="checkbox" disabled={listItems.length < 2} htmlFor="unfirst" checked={(outputSettings["customInfo"].layout == null && outputSettings["customInfo"].offset == null)} onChange={(e) => toggleFirstInfo(e.target.checked)}/>
                    Use Properties from First Entry
                </label><br/>

                {/* Custom Layout */}
                {(appStatuses.layout.header.length > 0) && <StatusPopUp
                    header={appStatuses.layout.header}
                    message={appStatuses.layout.message}
                />}
                {(outputSettings["customInfo"].layout == null) &&
                    <React.Fragment>
                        <label title="The layout LiveSplit will use for your output splits">
                            Starting Layout:<br/>{(outputSettings["customInfo"].layout == null && outputSettings["customInfo"].offset == null) && (listItems.length !=0 && listItems[0].layoutPath.length !=0 ? (unmaskPaths ? listItems[0].layoutPath : listItems[0].layoutPath.length + " characters masked") : "N/A")}
                        </label>
                        <br/><br/>
                    </React.Fragment>
                }
                {(outputSettings["customInfo"].layout != null) &&
                    <React.Fragment>
                    <TextField
                        title={"Starting Layout"}
                        unmaskCon={unmaskPaths}
                        moveCursorToEnd={true}
                        disableCon={listItems.length < 2}
                        placeholderText={"filepath\\filename.lsl"}
                        changeableValue={outputSettings["customInfo"]["layout"]}
                        updateKey={"layout"}
                        updateFunction={changeCustomSetting}
                        description={"The starting layout LiveSplit will use for your output splits"}
                        defaultButton={{
                            value: listItems.length != 0 ? listItems[0].layoutPath : "N/A",
                            description: "Revert back to first entry's starting layout"
                        }}
                        miscButton={{
                            function: promptLayoutFile,
                            disableCon: listItems.length < 2 || outputSettings["customInfo"].layout.length == 0,
                            description: "Select another layout that exists in your provided directory",
                            icon: <LiaFileUploadSolid />
                        }}
                    />
                    <input type="file" className = "layoutUpload" ref={layoutRef} value= "" accept={layoutExtension} onChange={changeLayoutFile} />
                    <br/>
                    </React.Fragment>
                }

                {/* Custom Offset */}
                {(appStatuses.offset.header.length > 0) && <StatusPopUp
                    header={appStatuses.offset.header}
                    message={appStatuses.offset.message}
                />}
                {(outputSettings["customInfo"].offset == null) && 
                    <label title="The starting offset LiveSplit will use for your output splits">Starting Offset:<br/>
                    {(outputSettings["customInfo"].layout == null && outputSettings["customInfo"].offset == null) && (listItems.length!=0 ? listItems[0].offset : "N/A")}</label>
                }
                {(outputSettings["customInfo"].offset != null) && 
                    <React.Fragment>
                    <TextField
                        title={"Starting Offset"}
                        unmaskCon={true}
                        moveCursorToEnd={false}
                        disableCon={listItems.length < 2}
                        placeholderText={"-0.00:00:00.0000000"}
                        changeableValue={outputSettings["customInfo"]["offset"]}
                        updateKey={"offset"}
                        updateFunction={changeCustomSetting}
                        description={"The starting offset LiveSplit will use for your output splits"}
                        defaultButton={{
                            value: listItems.length != 0 ? listItems[0].offset : "N/A",
                            description: "Revert back to first entry's starting offset"
                        }}
                    />
                    </React.Fragment>
                }
            </details>

        </React.Fragment>

    )

}