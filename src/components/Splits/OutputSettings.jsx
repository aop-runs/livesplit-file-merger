//Based on: https://medium.com/@aren.talb00/creating-a-custom-file-input-using-react-and-useref-233f5d4abfc9 & https://www.geeksforgeeks.org/reactjs/axios-in-react-a-guide-for-beginners/
import React, { useRef } from 'react'
import { DropDown } from '../Inputs/DropDown.jsx'
import { StatusPopUp } from '../Inputs/StatusPopUp.jsx'
import { TextField } from '../Inputs/TextField.jsx'
import { FaRegRectangleXmark } from "react-icons/fa6";
import { LiaFileUploadSolid } from "react-icons/lia";
import { TbListCheck } from "react-icons/tb";
import { isAValidFile, layoutExtension } from '../../utils/file.js'
import { templateParameters, defaultSetup, defaultPBComp, timeToSeconds } from "../../utils/livesplit.js";
import { fuzzySearchGames, searchCategoriesFromGame, cacheNewData } from "../../utils/srcapi.js";
import '../../styles/style.scss'

export const OutputSettings = ({ listItems, unmaskPaths, updateCanDownload, outputSettings, setOutputSettings, requestData, setRequestData, checkGameComp, appStatuses, updateStatus }) => {

    //Toggle whether selected comparison should be carried over to output file
    const toggleComparison = (index, value) => {
        setOutputSettings(outputSettings => {
            const updatedSettings = {...outputSettings}
            updatedSettings["usedComparisons"][index].used = value
            checkGameComp(updatedSettings)
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
                header: "Info",
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
        if(outputSettings["customInfo"].layout.length != 0){
            layoutRef.current.click()
        }
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

    //Used timings
    const updateTimingSelection = (value) => {
        toggleRadioButton("realTime", value.startsWith("real"))
        toggleRadioButton("gameTime", value.endsWith("game"))
    }
    const toggleRadioButton = (key, value) => {
        setOutputSettings(outputSettings => {
            const updatedSettings = {...outputSettings}
            updatedSettings["usedTimings"][key] = value
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
        if(key == "subs" && !value){
            changeTemplateText("final", "")
        }
        else if(key == "comp"){
            setOutputSettings(outputSettings => {
                const updatedSettings = {...outputSettings}
                if(!value){
                    for(let i = 0; i < updatedSettings["usedComparisons"].length; i++){
                        updatedSettings["usedComparisons"][i].used = true
                    }
                }
                checkGameComp(updatedSettings)
                if(updatedSettings["usedComparisons"].length == 0){
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
        else if(key == "pb" && !value){
            setOutputSettings(outputSettings => {
                const updatedSettings = {...outputSettings}
                updatedSettings["gameComp"] = defaultPBComp
                return updatedSettings
            })
            updateStatus("comp")
            updateCanDownload("comp", true)
        }
    }

    //Update template text
    const changeTemplateText = (key, value) => {
        setOutputSettings(outputSettings => {
            const updatedSettings = {...outputSettings}
            updatedSettings["templateText"][key] = value
            return updatedSettings
        })
    }

    //Add paramater to text from select box
    const addParamaterToText = (key, value) => {
        changeTemplateText(key, outputSettings["templateText"][key] + value)
    }

    //Update run metadata
    const changeRunMetadata = (key, value) => {
        setOutputSettings(outputSettings => {
            const updatedSettings = {...outputSettings}
            updatedSettings["runMetadata"][key] = value
            return updatedSettings
        })
    }
    const clearRunMetadata = () => {
        changeRunMetadata("region", "")
        changeRunMetadata("platform", "")
        changeRunMetadata("variables", [])
        toggleCheckbox("emu", false)
    }

    //Update variable value
    const updateVariableValue = (name, choice) => {
        let foundIndex = outputSettings["runMetadata"]["variables"].indexOf(outputSettings["runMetadata"]["variables"].find(v => v.name == name))
        setOutputSettings(outputSettings => {
            const updatedSettings = {...outputSettings}
            if(foundIndex == -1){
                if(choice != ""){
                    updatedSettings["runMetadata"]["variables"].push({name: name, choice: choice})
                }
            }
            else{
                if(choice != ""){
                    updatedSettings["runMetadata"]["variables"][foundIndex] = {name: name, choice: choice}
                }
                else{
                    updatedSettings["runMetadata"]["variables"].splice(foundIndex, 1)
                }
            }
            return updatedSettings
        })
    }

    //Update run name
    const changeRunName = (key, value) => {
        setOutputSettings(outputSettings => {
            const updatedSettings = {...outputSettings}
            updatedSettings["runName"][key] = value
            return updatedSettings
        })
    }

    //Change game and category names from Speedrun.com Request
    const updateGameName = (name) => {
        if(name.length != 0){
            if(name != outputSettings["runName"]["game"] && outputSettings["runName"]["game"].length != 0){
                clearRunMetadata()
                clearCategoryData()
            }
            changeRunName("game", name)
            updateRequestData("selectedGame", requestData.game.find(g => g.name == name))
        }
    }
    const updateCategoryName = (name) => {
        if(name.length != 0){
            if(name != outputSettings["runName"]["category"] && outputSettings["runName"]["category"].length != 0){
                changeRunMetadata("variables", [])
            }
            changeRunName("category", name)
            updateRequestData("selectedCategory", requestData.category.find(c => c.name == name))
        }
    }
    const updateRequestData = (key, value) => {
        setRequestData(requestData => {
            const updatedRequestData= {...requestData}
            updatedRequestData[key] = value
            return updatedRequestData
        })
    }

    //Speedrun.com Request to gather list of fuzzy searched games based on input
    const fetchGamesFromSRC = () => {
        clearRunMetadata()
        changeRunName("category", "")
        updateStatus("game", {
            header: "Loading...",
            message: ["Searching for game names matching " + outputSettings["runName"]["game"] + " on Speedrun.com"]
        })
        const gameQuery = fuzzySearchGames(outputSettings["runName"]["game"])
        gameQuery.then(
            (response) => {
            updateRequestData("selectedGame", null)
            if(response.data.data.length == 0){
                updateStatus("game", {
                    header: "Error",
                    message: ["No results were found on Speedrun.com matching " + outputSettings["runName"]["game"]]
                })
            }
            else{
                let games = []
                for(let foundGame of response.data.data){
                    games.push({id: foundGame.id, name: foundGame.names.international})
                }
                updateRequestData("game", games)
                updateStatus("game", {
                    header: "Success",
                    message: ["Found " + games.length + " result" + (games.length != 1 ? "s" : "") + " matching " + outputSettings["runName"]["game"] + " from Speedrun.com"]
                })
            }
            cacheNewData("Game", outputSettings["runName"]["game"], response.data)
        })
        gameQuery.catch(
            (error) => {
            updateStatus("game", {
                header: "Error",
                message: ["Unable to fetch game names from Speedrun.com - " + error]
            })
        })
    }
    const clearGameData = () => {
        clearCategoryData()
        updateRequestData("game", [])
        updateRequestData("selectedGame", null)
        updateStatus("game")
    }

    //Speedrun.com Request to categories from Speedrun.com for currently selected game
    const fetchCategoriesFromSRC = () => {
        clearRunMetadata()
        changeRunName("category", "")
        updateStatus("category", {
            header: "Loading...",
            message: ["Searching for categories for " + requestData.selectedGame.name + " on Speedrun.com"]
        })
        const categoryQuery = searchCategoriesFromGame(requestData.selectedGame.id)
        categoryQuery.then(
            (response) => {
            if(response.data.data.length == 0){
                updateStatus("category", {
                    header: "Error",
                    message: ["No categories were found on Speedrun.com for " + requestData.selectedGame.name]
                })
            }
            else{
                let categories = []
                for(let foundCategory of response.data.data.categories.data){
                    if(foundCategory.type == "per-game"){
                        categories.push({
                            name: foundCategory.name,
                            emuAllowed: response.data.data.ruleset["emulators-allowed"],
                            platforms: response.data.data.platforms.data.map(p => p.name),
                            regions: response.data.data.regions.data.map(r => r.name),
                            variables: foundCategory.variables.data.map(v => {
                                const obj = {}
                                obj["name"] = v.name,
                                obj["choices"] = Object.keys(v.values.values).map(id => v.values.values[id].label)
                                return obj
                            })
                        })
                    }
                }
                updateRequestData("category", categories)
                updateStatus("category", {
                    header: "Success",
                    message: ["Found " + categories.length + " categor" + (categories.length != 1 ? "ies" : "y") + " for " + requestData.selectedGame.name + " on Speedrun.com"]
                })
            }
            cacheNewData("Category", requestData.selectedGame.id, response.data)
        })
        categoryQuery.catch(
            (error) => {
            updateStatus("category", {
                header: "Error",
                message: ["Unable to fetch category names from Speedrun.com - " + error]
            })
        })
    }
    const fetchCategoriesFromSRCNoID = () => {
        clearRunMetadata()
        changeRunName("category", "")
        updateStatus("category", {
            header: "Loading...",
            message: ["Searching for game id for " + outputSettings["runName"]["game"] + " on Speedrun.com"]
        })
        const gameQuery = fuzzySearchGames(outputSettings["runName"]["game"])
        gameQuery.then(
            (response1) => {
            updateRequestData("selectedGame", null)
            let games = []
            if(response1.data.data.length == 0){
                updateStatus("category", {
                    header: "Error",
                    message: ["No results were found on Speedrun.com matching " + outputSettings["runName"]["game"]]
                })
            }
            else{
                for(let foundGame of response1.data.data){
                    games.push({id: foundGame.id, name: foundGame.names.international})
                }
                updateRequestData("game", games)
            }
            cacheNewData("Game", outputSettings["runName"]["game"], response1.data)
            
            //Request catgory once the respective game's ID is found
            let gameID = games.find(g => g.name == outputSettings["runName"]["game"]) 
            if(gameID != undefined){
                updateRequestData("selectedGame", gameID)
                updateStatus("category", {
                    header: "Loading...",
                    message: ["Searching for categories for " + gameID.name + " on Speedrun.com"]
                })
                const categoryQuery = searchCategoriesFromGame(gameID.id)
                categoryQuery.then(
                    (response2) => {
                    if(response2.data.data.length == 0){
                        updateStatus("category", {
                            header: "Error",
                            message: ["No categories were found on Speedrun.com for " + gameID.name]
                        })
                    }
                    else{
                        let categories = []
                        for(let foundCategory of response2.data.data.categories.data){
                            if(foundCategory.type == "per-game"){
                                categories.push({
                                    name: foundCategory.name,
                                    emuAllowed: response2.data.data.ruleset["emulators-allowed"],
                                    platforms: response2.data.data.platforms.data.map(p => p.name),
                                    regions: response2.data.data.regions.data.map(r => r.name),
                                    variables: foundCategory.variables.data.map(v => {
                                        const obj = {}
                                        obj["name"] = v.name,
                                        obj["choices"] = Object.keys(v.values.values).map(id => v.values.values[id].label)
                                        return obj
                                    })
                                })
                            }
                        }
                        updateRequestData("category", categories)
                        updateStatus("category", {
                            header: "Success",
                            message: ["Found " + categories.length + " categor" + (categories.length != 1 ? "ies" : "y") + " for " + gameID.name + " on Speedrun.com"]
                        })
                    }
                    cacheNewData("Category", gameID.id, response2.data)
                })
                categoryQuery.catch(
                    (error) => {
                    updateStatus("category", {
                        header: "Error",
                        message: ["Unable to fetch category names from Speedrun.com - " + error]
                    })
                })
            }
            else{
                updateStatus("category", {
                    header: "Error",
                    message: ["No game id was found on Speedrun.com matching " + outputSettings["runName"]["game"]]
                })
            }
        })
        gameQuery.catch(
            (error) => {
            updateStatus("category", {
                header: "Error",
                message: ["Unable to fetch game names from Speedrun.com - " + error]
            })
        })
    }
    const clearCategoryData = () => {
        clearRunMetadata()
        updateRequestData("category", [])
        updateRequestData("selectedCategory", null)
        updateStatus("category")
    }

    //Manage SRC Requests
    const runRequestFromSRC = (type) => {
        if(type == "game"){
            fetchGamesFromSRC()
        }
        else if(type == "category"){
            if(requestData.selectedGame != null){
                fetchCategoriesFromSRC()
            }
            else{
                fetchCategoriesFromSRCNoID()
            }      
        }
    }

    return (
    
        <React.Fragment>

            {/* Split Settings */}
            <details title="Click to open/close this section">
                <summary className ="sectionTitle">
                    Split Settings
                </summary>
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
                </label><br/>

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
                <TextField
                    title={"Setup Split Time"}
                    unmaskCon={true}
                    moveCursorToEnd={false}
                    disableCon={listItems.length < 2}
                    placeholderText={"0.00:00:00.0000000"}
                    changeableValue={listItems.length >= 2 ? outputSettings["setupTime"] : ""}
                    updateFunction={updateSetupTime}
                    description={"The time allotted for setup splits for split calculations"}
                    defaultButton={{
                        value: defaultSetup,
                        description: "Revert back to default setup split time"
                    }}
                />
            </details><br/>

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
                            disableCon: outputSettings["customInfo"].layout.length == 0,
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
            </details><br/>
            
            {/* Comparisons Present in Each Item */}
            <details title="Click to open/close this section">
                <summary className ="sectionTitle">
                    Transferable Comparisons
                </summary>
                {outputSettings["toggleSettings"]["comp"] && outputSettings["usedComparisons"].length == 0 &&
                    <React.Fragment>
                    {(appStatuses.found.header.length > 0) && <StatusPopUp
                        header={appStatuses.found.header}
                        message={appStatuses.found.message}
                    />}
                    </React.Fragment>
                }
                <label id="compbox" title="Choose whether to carry over other comparisons found from your split files">
                    <input type="checkbox" disabled={listItems.length < 2} htmlFor="compbox" checked={outputSettings["toggleSettings"]["comp"]} onChange={(e) => toggleCheckbox("comp", e.target.checked)}/>
                    Carry Over Found Comparisons
                </label>
                {outputSettings["toggleSettings"]["comp"] && outputSettings["usedComparisons"].length != 0 &&
                    <div title="Comparisons present in every file that can be toggled whether they can be carried over to your output splits">
                        <br/>
                        <label>Comparisons:</label><br/>
                        {outputSettings["usedComparisons"].map((comp, index) => {
                            return (
                                <label id={comp.name} key={index}>
                                    <input type="checkbox" disabled={listItems.length < 2} htmlFor={comp.name} checked={comp.used} onChange={(e) => toggleComparison(index, e.target.checked)}/>
                                    {comp.name}<br/>
                                </label>
                            );
                        })}
                        {!(listItems.length < 2 || outputSettings["usedComparisons"].length == 0 || (Array.from(new Set(outputSettings["usedComparisons"].map((comp) => {return comp.used})))[0] == true && new Set(outputSettings["usedComparisons"].map((comp) => {return comp.used})).size == 1)) &&
                            <button className = "comparison-icon" onClick={() => toggleAllComparisons(true)} title="Toogle all above comparison settings on">
                                <TbListCheck />
                            </button>
                        }
                        {!(listItems.length < 2 || outputSettings["usedComparisons"].length == 0 || (Array.from(new Set(outputSettings["usedComparisons"].map((comp) => {return comp.used})))[0] == false && new Set(outputSettings["usedComparisons"].map((comp) => {return comp.used})).size == 1)) &&
                            <button className = "comparison-icon" onClick={() => toggleAllComparisons(false)} title="Toogle all above comparison settings off">
                                <FaRegRectangleXmark />
                            </button>
                        }
                    </div>
                }
            </details><br/>

            {/* Timing Types */}
            <details title="Click to open/close this section">
                <summary className ="sectionTitle">
                    Timing Methods
                </summary>
                <label title="Carry over only real time for segments from your split files">
                    <input type="radio" name="timings" value="real" disabled={listItems.length < 2} checked={outputSettings["usedTimings"].realTime && !outputSettings["usedTimings"].gameTime} onChange={(e) => updateTimingSelection(e.target.value)}/>Carry Over Real Time
                </label><br/>
                <label title="Carry over only game time for segments from your split files">
                    <input type="radio" name="timings" value="game" disabled={listItems.length < 2} checked={!outputSettings["usedTimings"].realTime && outputSettings["usedTimings"].gameTime} onChange={(e) => updateTimingSelection(e.target.value)}/>Carry Over Game Time
                </label><br/>
                <label title="Carry over both real time and game time for segments from your split files">
                    <input type="radio" name="timings" value="realgame" disabled={listItems.length < 2} checked={outputSettings["usedTimings"].realTime && outputSettings["usedTimings"].gameTime} onChange={(e) => updateTimingSelection(e.target.value)}/>Carry Over Real Time & Game Time
                </label>
            </details><br/>

            {/* Splits Templates */}
            <details title="Click to open/close this section">
                <summary className ="sectionTitle">
                    Split Templates
                </summary>
                <label id="subsbox" title="Choose whether to create new subsplits for each game (Note: This setting will remove existing subsplits from your splits files if toggled on)">
                    <input type="checkbox" disabled={listItems.length < 2} htmlFor="subsbox" checked={outputSettings["toggleSettings"]["subs"]} onChange={(e) => toggleCheckbox("subs", e.target.checked)}/>
                    Create Subsplits for Each Game
                </label>
                
                <br/><br/>
                {/* Setup Template */}
                <TextField
                    title={"Setup Split"}
                    unmaskCon={true}
                    moveCursorToEnd={false}
                    disableCon={listItems.length < 2}
                    placeholderText={"Template Text"}
                    changeableValue={outputSettings["templateText"]["setup"]}
                    updateKey={"setup"}
                    updateFunction={changeTemplateText}
                    description={"The template that will be used for every setup split in between games"}
                    dropDown={{
                        title: "Append Parameter",
                        updateFunction: addParamaterToText,
                        description: "Select parameters to add to the setup split template",
                        choices: templateParameters.map((p, index) => {
                            return (
                                <option key={index} value={p.param}>
                                    {p.name}
                                </option>
                            );
                        })
                    }}
                />
                
                {/* Subsplit Template */}
                {outputSettings["toggleSettings"]["subs"] && 
                <React.Fragment>
                <br/>
                <TextField
                    title={"Game's Final Subsplit"}
                    unmaskCon={true}
                    moveCursorToEnd={false}
                    disableCon={listItems.length < 2}
                    placeholderText={"Template Text"}
                    changeableValue={outputSettings["templateText"]["final"]}
                    updateKey={"final"}
                    updateFunction={changeTemplateText}
                    description={"The template that will be used for the last subsplit in each game"}
                    dropDown={{
                        title: "Append Parameter",
                        updateFunction: addParamaterToText,
                        description: "Select parameters to add to the final subsplit template",
                        choices: templateParameters.map((p, index) => {
                            return (
                                <option key={index} value={p.param}>
                                    {p.name}
                                </option>
                            );
                        })
                    }}
                />
                </React.Fragment>
                }
            </details><br/>

            {/* Run Name */}
            <details title="Click to open/close this section">
                <summary className ="sectionTitle">
                    Run Name
                </summary>
                {/* Game Name */}
                {(appStatuses.game.header.length > 0) && <StatusPopUp
                    header={appStatuses.game.header}
                    message={appStatuses.game.message}
                />}
                <TextField
                    title={"Game Name"}
                    unmaskCon={true}
                    moveCursorToEnd={false}
                    disableCon={listItems.length < 2}
                    placeholderText={"Game"}
                    changeableValue={outputSettings["runName"]["game"]}
                    updateKey={"game"}
                    updateFunction={changeRunName}
                    enterFunction={{
                        function: fetchGamesFromSRC,
                        enableCon: outputSettings["runName"]["game"].length != 0
                    }}
                    description={"The name of the game for the output splits file"}
                />
                    <button type="button" disabled={listItems.length < 2 || outputSettings["runName"]["game"].length == 0} onClick={() => runRequestFromSRC("game")} title="Fetches list of games fuzzy searched from Speedrun.com">
                        Fetch Games from Input
                    </button>
                    {requestData.game.length != 0 &&
                        <DropDown
                            title={"Select Game"}
                            setValue={requestData.selectedGame != null ? requestData.selectedGame.name : ""}
                            disableCon={listItems.length < 2 || requestData.game.length == 0}
                            updateFunction={updateGameName}
                            canClickToRefresh={true}
                            description={"Select game name for your output splits from Speedrun.com request"}
                            choices={requestData.game.map((g, index) => {
                                return (
                                    <option key={index} value={g.name}>
                                        {g.name}
                                    </option>
                                );
                            })}
                            clearButton={{
                                clearFunction: clearGameData,
                                description: "Clear game selection results from Speedrun.com request"
                            }}
                        />
                    }
                <br/><br/>
                {/* Category Name */}
                {(appStatuses.category.header.length > 0) && <StatusPopUp
                    header={appStatuses.category.header}
                    message={appStatuses.category.message}
                />}
                <TextField
                    title={"Category Name"}
                    unmaskCon={true}
                    moveCursorToEnd={false}
                    disableCon={listItems.length < 2}
                    placeholderText={"Category"}
                    changeableValue={outputSettings["runName"]["category"]}
                    updateKey={"category"}
                    updateFunction={changeRunName}
                    enterFunction={{
                        function: requestData.selectedGame != null ? fetchCategoriesFromSRC : fetchCategoriesFromSRCNoID,
                        enableCon: outputSettings["runName"]["game"].length != 0
                    }}
                    description={"The name of the category for the output splits file"}
                />
                    <button type="button" disabled={listItems.length < 2 || outputSettings["runName"]["game"].length == 0} onClick={() => runRequestFromSRC("category")} title="Fetches category of a requested game from Speedrun.com">
                        {"Fetch Categories from " + (requestData.selectedGame != null ? requestData.selectedGame.name : "Above Game")}
                    </button>
                    {requestData.category.length != 0 &&
                        <DropDown
                            title={"Select Category"}
                            setValue={requestData.selectedCategory != null ? requestData.selectedCategory.name : ""}
                            disableCon={listItems.length < 2 || requestData.category.length == 0}
                            updateFunction={updateCategoryName}
                            canClickToRefresh={true}
                            description={"Select category name for your output splits from requested Speedrun.com game"}
                            choices={requestData.category.map((c, index) => {
                                return (
                                    <option key={index} value={c.name}>
                                        {c.name}
                                    </option>
                                );
                            })}
                            clearButton={{
                                clearFunction: clearCategoryData,
                                description: "Clear category selection results from Speedrun.com request"
                            }}
                        />
                    }
                {/* Category Metadata */}
                {requestData.selectedCategory != null &&
                    <React.Fragment>
                    <br/>
                    {requestData.selectedCategory.regions.length != 0 &&
                        <React.Fragment>
                        <br/>
                        <DropDown
                            title={"Select Region"}
                            header={"Region"}
                            disableCon={listItems.length < 2 || requestData.category.length == 0}
                            updateKey={"region"}
                            updateFunction={changeRunMetadata}
                            canClickToRefresh={false}
                            description={"Select region name for your output splits from requested Speedrun.com game"}
                            choices={requestData.selectedCategory.regions.map((r, index) => {
                                return (
                                    <option key={index} value={r}>
                                        {r}
                                    </option>
                                );
                            })}
                        />
                        <br/>
                        </React.Fragment>
                    }
                    {requestData.selectedCategory.platforms.length != 0 &&
                        <React.Fragment>
                        <br/>
                        <DropDown
                            title={"Select Platform"}
                            header={"Platform"}
                            disableCon={listItems.length < 2 || requestData.category.length == 0}
                            updateKey={"platform"}
                            updateFunction={changeRunMetadata}
                            canClickToRefresh={false}
                            description={"Select platform name for your output splits from requested Speedrun.com game"}
                            choices={requestData.selectedCategory.platforms.map((p, index) => {
                                return (
                                    <option key={index} value={p}>
                                        {p}
                                    </option>
                                );
                            })}
                        /><br/>
                        </React.Fragment>
                    }
                    {requestData.selectedCategory.emuAllowed &&
                        <React.Fragment>
                        <label id="emubox" title="Choose whether you are using an emulator for your run">
                            <input type="checkbox" disabled={listItems.length < 2 || requestData.category.length == 0} htmlFor="emubox" checked={outputSettings["toggleSettings"]["emu"]} onChange={(e) => toggleCheckbox("emu", e.target.checked)}/>
                            Use Emulator
                        </label><br/>
                        </React.Fragment>
                    }
                    {/* Variables */}
                    {requestData.selectedCategory.variables.length != 0 &&
                        <React.Fragment>
                        <br/><label>Variables:</label><br/><br/>
                        {requestData.selectedCategory.variables.map((v, index) => {
                                return (
                                    <React.Fragment key={index}>
                                    <DropDown
                                        title={"Select Choice"}
                                        header={v.name}
                                        setValue={outputSettings["runMetadata"]["variables"].find(va => va.name == v.name) !== undefined ? outputSettings["runMetadata"]["variables"].find(va => va.name == v.name).choice : ""}
                                        updateKey={v.name}
                                        updateFunction={updateVariableValue}
                                        canClickToRefresh={false}
                                        description={"Select this variable's name for your output splits from requested Speedrun.com game"}
                                        choices={v.choices.map((v, index) => {
                                            return (
                                                <option key={index} value={v}>
                                                    {v}
                                                </option>
                                            );
                                        })}
                                        />
                                    <br/>
                                    {index != requestData.selectedCategory.variables.length - 1 &&
                                        <br/>
                                    }
                                    </React.Fragment>
                                );
                            })}
                        </React.Fragment>
                    }
                    </React.Fragment>
                }
                

            </details>

        </React.Fragment>

    )

}