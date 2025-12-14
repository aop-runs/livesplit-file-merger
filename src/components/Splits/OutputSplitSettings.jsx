//Based on: https://www.geeksforgeeks.org/reactjs/axios-in-react-a-guide-for-beginners/
import React from 'react'
import { StatusBox } from '../StatusBox.jsx'
import { templateParameters, defaultPBComp } from "../../utils/livesplit.js";
import { fuzzySearchGames, searchCategoriesFromGame, cacheNewData } from "../../utils/srcapi.js";

export const OutputSplitSettings = ({ listItems, updateCanDownload, setGameComp, usedTimings, setUsedTimings, toggleSettings, setToggleSettings, templateText, setTemplateText, runName, setRunName, requestData, setRequestData, selectedRequestedGame, setSelectedRequestedGame, appStatuses, updateStatus, initialStatus }) => {

    //Used timings
    const updateTimingSelection = (value) => {
        toggleRadioButton("realTime", value.startsWith("real"))
        toggleRadioButton("gameTime", value.endsWith("game"))
    }
    const toggleRadioButton = (key, value) => {
        setUsedTimings(usedTimings => {
            const updatedUsedTimings = {...usedTimings}
            updatedUsedTimings[key] = value
            return updatedUsedTimings
        })
    }

    //Toggle checkbox
    const toggleCheckbox = (key, value) => {
        setToggleSettings(toggleSettings => {
            const updatedToggleSettings = {...toggleSettings}
            updatedToggleSettings[key] = value
            return updatedToggleSettings
        })
        if(key == "subs" && !value){
            changeTemplateText("final", "")
        }
        else if(key == "pb" && !value){
            setGameComp(defaultPBComp)
            updateStatus("comp", initialStatus)
            updateCanDownload("comp", true)
        }
    }
    const toggleAllCheckboxes = (value) => {
        for(let key of Object.keys(toggleSettings)){
            toggleCheckbox(key, value)
        }
    }

    //Update template text
    const changeTemplateText = (key, value) => {
        setTemplateText(templateText => {
            const updatedTemplateText = {...templateText}
            updatedTemplateText[key] = value
            return updatedTemplateText
        })
    }

    //Add paramater to text from select box
    const addParamaterToText = (key, value) => {
        changeTemplateText(key, templateText[key] + value)
    }

    //Update run name
    const changeRunName = (key, value) => {
        setRunName(runName => {
            const updatedRunName = {...runName}
            updatedRunName[key] = value
            return updatedRunName
        })
    }

    //Change game and category names from Speedrun.com Request
    const updateGameName = (name) => {
        changeRunName("game", name)
        setSelectedRequestedGame(requestData.game.find(g => g.name == name))
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
            setSelectedRequestedGame(null)
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
            message: ["Searching for categories for " + selectedRequestedGame.name + " on Speedrun.com"]
        })
        const categoryQuery = searchCategoriesFromGame(selectedRequestedGame.id)
        categoryQuery.then(
            (response) => {
            if(response.data.data.length == 0){
                updateStatus("category", {
                    header: "Error",
                    message: ["No categories were found on Speedrun.com for " + selectedRequestedGame.name]
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
                    message: ["Found " + categories.length + " categor" + (categories.length != 1 ? "ies" : "y") + " for " + selectedRequestedGame.name + " on Speedrun.com"]
                })
            }
            cacheNewData("Category", selectedRequestedGame.id, response.data)
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
            //Settings for output splits file
            <React.Fragment>
                
                {/* Timing Types */}
                <label title="Carry over only real time for segments from your split files">
                    <input type="radio" name="timings" value="real" disabled={listItems.length < 2} checked={usedTimings.realTime && !usedTimings.gameTime} onChange={(e) => updateTimingSelection(e.target.value)}/>Carry over Real Time
                </label><br/>
                <label title="Carry over only game time for segments from your split files">
                    <input type="radio" name="timings" value="game" disabled={listItems.length < 2} checked={!usedTimings.realTime && usedTimings.gameTime} onChange={(e) => updateTimingSelection(e.target.value)}/>Carry over Game Time
                </label><br/>
                <label title="Carry over both real time and game time for segments from your split files">
                    <input type="radio" name="timings" value="realgame" disabled={listItems.length < 2} checked={usedTimings.realTime && usedTimings.gameTime} onChange={(e) => updateTimingSelection(e.target.value)}/>Carry over Real Time & Game Time
                </label><br/>

                {/* Toggle Settings */}
                <br/>
                <label id="pbbox" title="Choose whether to carry over your pbs from your split files as a new comparison">
                    Carry over PBs: <input type="checkbox" disabled={listItems.length < 2} htmlFor="pbbox" checked={toggleSettings["pb"]} onChange={(e) => toggleCheckbox("pb", e.target.checked)}/>
                </label><br/>
                <label id="sobbox" title="Choose whether to carry over your sum of best segments from your split files">
                    Carry over Sum of Best Times: <input type="checkbox" disabled={listItems.length < 2} htmlFor="sobbox" checked={toggleSettings["sob"]} onChange={(e) => toggleCheckbox("sob", e.target.checked)}/>
                </label><br/>
                <label id="compbox" title="Choose whether to carry over other comparisons found from your split files">
                    Carry over Other Comparisons: <input type="checkbox" disabled={listItems.length < 2} htmlFor="compbox" checked={toggleSettings["comp"]} onChange={(e) => toggleCheckbox("comp", e.target.checked)}/>
                </label><br/>
                <label id="iconbox" title="Choose whether to carry over segment icons from your splits files">
                    Carry over Segment Icons: <input type="checkbox" disabled={listItems.length < 2} htmlFor="iconbox" checked={toggleSettings["icon"]} onChange={(e) => toggleCheckbox("icon", e.target.checked)}/>
                </label><br/>
                <label id="subsbox" title="Choose whether to create new subsplits for each game (Note: This setting will remove existing subsplits from your splits files if toggled on)">
                    Create Subsplits for Each Game: <input type="checkbox" disabled={listItems.length < 2} htmlFor="subsbox" checked={toggleSettings["subs"]} onChange={(e) => toggleCheckbox("subs", e.target.checked)}/>
                </label><br/>
                <button type="button" disabled={listItems.length < 2 || (Array.from(new Set(Object.values(toggleSettings)))[0] == true && new Set(Object.values(toggleSettings)).size == 1)} onClick={() => toggleAllCheckboxes(true)} title="Toogle all above checkbox settings on">
                    Toggle Above Settings On
                </button>
                <button type="button" disabled={listItems.length < 2 || (Array.from(new Set(Object.values(toggleSettings)))[0] == false && new Set(Object.values(toggleSettings)).size == 1)} onClick={() => toggleAllCheckboxes(false)} title="Toogle all above checkbox settings off">
                    Toggle Above Settings Off
                </button>

                {/* Splits Templates */}
                <br/><br/>
                {/* Setup Template */}
                <div title="The template that will be used for every setup split in between games">
                    <label>Setup Split Template: </label>
                    <input type="text" disabled={listItems.length < 2} placeholder={"Template Text"} value={templateText["setup"]} onChange={(e) => changeTemplateText("setup", e.target.value)}/>
                    <button type="button" disabled={listItems.length < 2 || templateText["setup"].length == 0} onClick={() => changeTemplateText("setup", "")} title="Clear textfield for setup split template">
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
                {toggleSettings["subs"] && 
                    <div title="The template that will be used for that last subsplit in each game">
                        <label>Game's Final Subsplit Template: </label>
                        <input type="text" disabled={listItems.length < 2} placeholder={"Template Text"} value={templateText["final"]} onChange={(e) => changeTemplateText("final", e.target.value)}/>
                        <button type="button" disabled={listItems.length < 2 || templateText["final"].length == 0} onClick={() => changeTemplateText("final", "")} title="Clear textfield for game's final subsplit template">
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
                    hideStatus={() => updateStatus("game", initialStatus)}
                />}
                <div title="The name of the game for the output splits file">
                    <label>Output Game Name: </label>
                    <input type="text" disabled={listItems.length < 2} placeholder={"Game Name"} value={runName["game"]} onChange={(e) => changeRunName("game", e.target.value)}/>
                    <button type="button" disabled={listItems.length < 2 || runName["game"].length == 0} onClick={() => fetchGameFromSRC(runName["game"])} title="Fetches list of games fuzzy searched from Speedrun.com">
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
                    <button type="button" disabled={listItems.length < 2 || runName["game"].length == 0} onClick={() => changeRunName("game", "")} title="Clear text field for the output's game name">
                        Clear Game Name
                    </button>
                </div>
                {/* Category Name */}
                {(appStatuses.category.header.length > 0) && <StatusBox
                    header={appStatuses.category.header}
                    message={appStatuses.category.message}
                    hideStatus={() => updateStatus("category", initialStatus)}
                />}
                <div title="The name of the category for the output splits file">
                    <label>Output Category Name: </label>
                    <input type="text" disabled={listItems.length < 2} placeholder={"Category Name"} value={runName["category"]} onChange={(e) => changeRunName("category", e.target.value)}/>
                    <button type="button" disabled={listItems.length < 2 || selectedRequestedGame == null} onClick={() => fetchCategoriesFromSRC()} title="Fetches category of a requested game from Speedrun.com">
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
                    <button type="button" disabled={listItems.length < 2 || runName["category"].length == 0} onClick={() => changeRunName("category", "")} title="Clear text field for the output's category name">
                        Clear Category Name
                    </button>
                </div>

            </React.Fragment>
        )
    }