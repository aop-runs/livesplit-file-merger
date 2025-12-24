//Based on: https://www.geeksforgeeks.org/reactjs/axios-in-react-a-guide-for-beginners/
import React from 'react'
import { DropDown } from '../Inputs/DropDown.jsx'
import { StatusPopUp } from '../Inputs/StatusPopUp.jsx'
import { TextField } from '../Inputs/TextField.jsx'
import { fuzzySearchGames, searchCategoriesFromGame, cacheNewData } from "../../utils/srcapi.js";
import '../../styles/style.scss'

export const RunName = ({ listItems, outputSettings, setOutputSettings, requestData, setRequestData, appStatuses, updateStatus }) => {

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
        changeRunMetadata("emu", false)
        changeRunMetadata("variables", [])
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
                            <input type="checkbox" disabled={listItems.length < 2 || requestData.category.length == 0} htmlFor="emubox" checked={outputSettings["runMetadata"]["emu"]} onChange={(e) => changeRunMetadata("emu", e.target.checked)}/>
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