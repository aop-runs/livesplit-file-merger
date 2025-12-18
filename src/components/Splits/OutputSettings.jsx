//Based on: https://medium.com/@aren.talb00/creating-a-custom-file-input-using-react-and-useref-233f5d4abfc9 & https://www.geeksforgeeks.org/reactjs/axios-in-react-a-guide-for-beginners/
import React, { useRef } from 'react'
import { StatusBox } from '../Inputs/StatusBox.jsx'
import { isAValidFile, layoutExtension } from '../../utils/file.js'
import { templateParameters, defaultSetup, defaultPBComp, timeToSeconds } from "../../utils/livesplit.js";
import { fuzzySearchGames, searchCategoriesFromGame, cacheNewData } from "../../utils/srcapi.js";

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
    const toggleAllCheckboxes = (value) => {
        for(let key of Object.keys(outputSettings["toggleSettings"])){
            toggleCheckbox(key, value)
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
        changeRunName("game", name)
        updateRequestData("selectedGame", requestData.game.find(g => g.name == name))
    }
    const updateCategoryName = (name) => {
        changeRunName("category", name)
    }
    const updateRequestData = (key, value) => {
        setRequestData(requestData => {
            const updatedRequestData= {...requestData}
            updatedRequestData[key] = value
            return updatedRequestData
        })
    }

    //Speedrun.com Request to gather list of fuzzy searched games based on input
    const fetchGameFromSRC = (game) => {
        updateStatus("game", {
            header: "Loading...",
            message: ["Searching for game names matching " + game + " on Speedrun.com"]
        })
        const gameQuery = fuzzySearchGames(game)
        gameQuery.then(
            (response) => {
            updateRequestData("selectedGame", null)
            if(response.data.data.length == 0){
                updateStatus("game", {
                    header: "Error",
                    message: ["No results were found on Speedrun.com matching " + game]
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
                    message: ["Found " + games.length + " result" + (games.length != 1 ? "s" : "") + " matching " + game + " from Speedrun.com"]
                })
            }
            cacheNewData("Game", game, response.data)
        })
        gameQuery.catch(
            (error) => {
            updateStatus("game", {
                header: "Error",
                message: ["Unable to fetch game names from Speedrun.com - " + error]
            })
        })
    }

    //Speedrun.com Request to categories from Speedrun.com for currently selected game
    const fetchCategoriesFromSRC = () => {
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
                        categories.push({name: foundCategory.name})
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

    return (
    
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
                <button type="button" disabled={listItems.length < 2 || outputSettings["usedComparisons"].length == 0 || (Array.from(new Set(outputSettings["usedComparisons"].map((comp) => {return comp.used})))[0] == true && new Set(outputSettings["usedComparisons"].map((comp) => {return comp.used})).size == 1)} onClick={() => toggleAllComparisons(true)} title="Toogle all above comparison settings on">
                    Toggle All Comparisons On
                </button>
                <button type="button" disabled={listItems.length < 2 || outputSettings["usedComparisons"].length == 0 || (Array.from(new Set(outputSettings["usedComparisons"].map((comp) => {return comp.used})))[0] == false && new Set(outputSettings["usedComparisons"].map((comp) => {return comp.used})).size == 1)} onClick={() => toggleAllComparisons(false)} title="Toogle all above comparison settings off">
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

            {/* Timing Types */}
            <br/>
            <label title="Carry over only real time for segments from your split files">
                <input type="radio" name="timings" value="real" disabled={listItems.length < 2} checked={outputSettings["usedTimings"].realTime && !outputSettings["usedTimings"].gameTime} onChange={(e) => updateTimingSelection(e.target.value)}/>Carry over Real Time
            </label><br/>
            <label title="Carry over only game time for segments from your split files">
                <input type="radio" name="timings" value="game" disabled={listItems.length < 2} checked={!outputSettings["usedTimings"].realTime && outputSettings["usedTimings"].gameTime} onChange={(e) => updateTimingSelection(e.target.value)}/>Carry over Game Time
            </label><br/>
            <label title="Carry over both real time and game time for segments from your split files">
                <input type="radio" name="timings" value="realgame" disabled={listItems.length < 2} checked={outputSettings["usedTimings"].realTime && outputSettings["usedTimings"].gameTime} onChange={(e) => updateTimingSelection(e.target.value)}/>Carry over Real Time & Game Time
            </label><br/>

            {/* Toggle Settings */}
            <br/>
            <label id="pbbox" title="Choose whether to carry over your pbs from your split files as a new comparison">
                <input type="checkbox" disabled={listItems.length < 2} htmlFor="pbbox" checked={outputSettings["toggleSettings"]["pb"]} onChange={(e) => toggleCheckbox("pb", e.target.checked)}/>
                Carry over PBs
            </label><br/>
            <label id="sobbox" title="Choose whether to carry over your sum of best segments from your split files">
                <input type="checkbox" disabled={listItems.length < 2} htmlFor="sobbox" checked={outputSettings["toggleSettings"]["sob"]} onChange={(e) => toggleCheckbox("sob", e.target.checked)}/>
                Carry over Sum of Best Times
            </label><br/>
            <label id="compbox" title="Choose whether to carry over other comparisons found from your split files">
                <input type="checkbox" disabled={listItems.length < 2} htmlFor="compbox" checked={outputSettings["toggleSettings"]["comp"]} onChange={(e) => toggleCheckbox("comp", e.target.checked)}/>
                Carry over Other Comparisons
            </label><br/>
            <label id="iconbox" title="Choose whether to carry over segment icons from your splits files">
                <input type="checkbox" disabled={listItems.length < 2} htmlFor="iconbox" checked={outputSettings["toggleSettings"]["icon"]} onChange={(e) => toggleCheckbox("icon", e.target.checked)}/>
                Carry over Segment Icons
            </label><br/>
            <label id="subsbox" title="Choose whether to create new subsplits for each game (Note: This setting will remove existing subsplits from your splits files if toggled on)">
                <input type="checkbox" disabled={listItems.length < 2} htmlFor="subsbox" checked={outputSettings["toggleSettings"]["subs"]} onChange={(e) => toggleCheckbox("subs", e.target.checked)}/>
                Create Subsplits for Each Game
            </label><br/>
            <button type="button" disabled={listItems.length < 2 || (Array.from(new Set(Object.values(outputSettings["toggleSettings"])))[0] == true && new Set(Object.values(outputSettings["toggleSettings"])).size == 1)} onClick={() => toggleAllCheckboxes(true)} title="Toogle all above checkbox settings on">
                Toggle Above Settings On
            </button>
            <button type="button" disabled={listItems.length < 2 || (Array.from(new Set(Object.values(outputSettings["toggleSettings"])))[0] == false && new Set(Object.values(outputSettings["toggleSettings"])).size == 1)} onClick={() => toggleAllCheckboxes(false)} title="Toogle all above checkbox settings off">
                Toggle Above Settings Off
            </button>

            {/* Splits Templates */}
            <br/><br/>
            {/* Setup Template */}
            <div title="The template that will be used for every setup split in between games">
                <label>Setup Split Template: </label>
                <input type="text" disabled={listItems.length < 2} placeholder={"Template Text"} value={outputSettings["templateText"]["setup"]} onChange={(e) => changeTemplateText("setup", e.target.value)}/>
                <button type="button" disabled={listItems.length < 2 || outputSettings["templateText"]["setup"].length == 0} onClick={() => changeTemplateText("setup", "")} title="Clear textfield for setup split template">
                    Clear Setup Split Template
                </button>
                <select value="" disabled={listItems.length < 2} onChange={(e) => addParamaterToText("setup", e.target.value)} title="Select parameters to add to the setup split template">
                    <option value="">Add Parameter to Template</option>
                    {templateParameters.map((p, index) => {
                        return (
                            <option key={index} value={p.param}>
                                {p.name}
                            </option>
                        );
                    })}
                </select>
            </div>
            {/* Subsplit Template */}
            {outputSettings["toggleSettings"]["subs"] && 
                <div title="The template that will be used for that last subsplit in each game">
                    <label>Game's Final Subsplit Template: </label>
                    <input type="text" disabled={listItems.length < 2} placeholder={"Template Text"} value={outputSettings["templateText"]["final"]} onChange={(e) => changeTemplateText("final", e.target.value)}/>
                    <button type="button" disabled={listItems.length < 2 || outputSettings["templateText"]["final"].length == 0} onClick={() => changeTemplateText("final", "")} title="Clear textfield for game's final subsplit template">
                        Clear Final Subsplit Template
                    </button>
                    <select value="" disabled={listItems.length < 2} onChange={(e) => addParamaterToText("final", e.target.value)} title="Select parameters to add to the game's final subsplit template">
                        <option value="">Add Parameter to Template</option>
                        {templateParameters.map((p, index) => {
                            return (
                                <option key={index} value={p.param}>
                                    {p.name}
                                </option>
                            );
                        })}
                    </select>
                </div>
            }

            {/* Run Name */}
            <br/>
            {/* Game Name */}
            {(appStatuses.game.header.length > 0) && <StatusBox
                header={appStatuses.game.header}
                message={appStatuses.game.message}
                hideStatus={() => updateStatus("game")}
            />}
            <div title="The name of the game for the output splits file">
                <label>Output Game Name: </label>
                <input type="text" disabled={listItems.length < 2} placeholder={"Game Name"} value={outputSettings["runName"]["game"]} onChange={(e) => changeRunName("game", e.target.value)}/>
                <button type="button" disabled={listItems.length < 2 || outputSettings["runName"]["game"].length == 0} onClick={() => fetchGameFromSRC(outputSettings["runName"]["game"])} title="Fetches list of games fuzzy searched from Speedrun.com">
                    Fetch Game from Input
                </button>
                <select value="" disabled={listItems.length < 2 || requestData.game.length == 0} onChange={(e) => updateGameName(e.target.value)} title="Select game name for your output splits from Speedrun.com request">
                    <option value="">Select Game</option>
                    {requestData.game.map((g, index) => {
                        return (
                            <option key={index} value={g.name}>
                                {g.name}
                            </option>
                        );
                    })}
                </select>
                <button type="button" disabled={listItems.length < 2 || outputSettings["runName"]["game"].length == 0} onClick={() => changeRunName("game", "")} title="Clear text field for the output's game name">
                    Clear Game Name
                </button>
            </div>
            {/* Category Name */}
            {(appStatuses.category.header.length > 0) && <StatusBox
                header={appStatuses.category.header}
                message={appStatuses.category.message}
                hideStatus={() => updateStatus("category")}
            />}
            <div title="The name of the category for the output splits file">
                <label>Output Category Name: </label>
                <input type="text" disabled={listItems.length < 2} placeholder={"Category Name"} value={outputSettings["runName"]["category"]} onChange={(e) => changeRunName("category", e.target.value)}/>
                <button type="button" disabled={listItems.length < 2 || requestData.selectedGame == null} onClick={() => fetchCategoriesFromSRC()} title="Fetches category of a requested game from Speedrun.com">
                    Fetch Category from Above Request
                </button>
                <select value="" disabled={listItems.length < 2 || requestData.category.length == 0} onChange={(e) => updateCategoryName(e.target.value)} title="Select category name for your output splits from requested Speedrun.com game">
                    <option value="">Select Category</option>
                    {requestData.category.map((c, index) => {
                        return (
                            <option key={index} value={c.name}>
                                {c.name}
                            </option>
                        );
                    })}
                </select>
                <button type="button" disabled={listItems.length < 2 || outputSettings["runName"]["category"].length == 0} onClick={() => changeRunName("category", "")} title="Clear text field for the output's category name">
                    Clear Category Name
                </button>
            </div>

        </React.Fragment>

    )

}