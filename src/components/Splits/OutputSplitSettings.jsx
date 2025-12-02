//Based on: https://www.geeksforgeeks.org/reactjs/axios-in-react-a-guide-for-beginners/

import React, {  } from 'react'
import { templateParameters } from "../../utils/livesplit.js";

export const OutputSplitSettings = ({ listItems, toggleSettings, setToggleSettings, templateText, setTemplateText, runName, setRunName, initialStatus }) => {

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

    return (
            //Settings for output splits file
            <React.Fragment>
                
                {/* Toggle Settings */}
                <label id="pbbox" title="Choose whether to carry over your pbs from your split files as a new comparison">
                    Carry over PBs: <input type="checkbox" htmlFor="pbbox" checked={toggleSettings["pb"]} onChange={(e) => toggleCheckbox("pb", e.target.checked)}/>
                </label><br/>
                <label id="sobbox" title="Choose whether to carry over your sum of best segments from your split files">
                    Carry over Sum of Best Times: <input type="checkbox" htmlFor="sobbox" checked={toggleSettings["sob"]} onChange={(e) => toggleCheckbox("sob", e.target.checked)}/>
                </label><br/>
                <label id="compbox" title="Choose whether to carry over other comparisons found from your split files">
                    Carry over Other Comparisons: <input type="checkbox" htmlFor="compbox" checked={toggleSettings["comp"]} onChange={(e) => toggleCheckbox("comp", e.target.checked)}/>
                </label><br/>
                <label id="iconbox" title="Choose whether to carry over segment icons from your splits files">
                    Carry over Segment Icons: <input type="checkbox" htmlFor="iconbox" checked={toggleSettings["icon"]} onChange={(e) => toggleCheckbox("icon", e.target.checked)}/>
                </label><br/>
                <label id="subsbox" title="Choose whether to create new subsplits for each game (Note: This setting will remove existing subsplits from your splits files if toggled on)">
                    Create Subsplits for Each Game: <input type="checkbox" htmlFor="subsbox" checked={toggleSettings["subs"]} onChange={(e) => toggleCheckbox("subs", e.target.checked)}/>
                </label><br/>
                <button type="button" disabled={Array.from(new Set(Object.values(toggleSettings)))[0] == true && new Set(Object.values(toggleSettings)).size == 1} onClick={() => toggleAllCheckboxes(true)} title="Toogle all above checkbox settings on">
                    Toggle Above Settings On
                </button>
                <button type="button" disabled={Array.from(new Set(Object.values(toggleSettings)))[0] == false && new Set(Object.values(toggleSettings)).size == 1} onClick={() => toggleAllCheckboxes(false)} title="Toogle all above checkbox settings off">
                    Toggle Above Settings Off
                </button>

                {/* Splits Templates */}
                <br/><br/>
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
                <div title="The name of the game for the output splits file">
                    <label>Output Game Name: </label>
                    <input type="text" disabled={listItems.length < 2} placeholder={"Game Name"} value={runName["game"]} onChange={(e) => changeRunName("game", e.target.value)}/>
                    <button type="button" disabled={listItems.length < 2 || runName["game"].length == 0} onClick={() => changeRunName("game", "")} title="Clear text field for the output's game name">
                        Clear Game Name
                    </button>
                </div>
                <div title="The name of the category for the output splits file">
                    <label>Output Category Name: </label>
                    <input type="text" disabled={listItems.length < 2} placeholder={"Category Name"} value={runName["category"]} onChange={(e) => changeRunName("category", e.target.value)}/>
                    <button type="button" disabled={listItems.length < 2 || runName["category"].length == 0} onClick={() => changeRunName("category", "")} title="Clear text field for the output's category name">
                        Clear Category Name
                    </button>
                </div>

            </React.Fragment>
        )
    }