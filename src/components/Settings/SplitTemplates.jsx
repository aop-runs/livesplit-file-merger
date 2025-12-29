import React from 'react'
import { TextField } from '../Inputs/TextField.jsx'
import { templateParameters } from "../../utils/livesplit.js";
import '../../styles/style.scss'

export const SplitTemplates = ({ listItems, outputSettings, setOutputSettings }) => {

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

    return (
    
        <React.Fragment>

            {/* Splits Templates */}
            <details title="Click to open/close this section">
                <summary className ="sectionTitle">
                    Split Templates
                </summary>
                {outputSettings["toggleSettings"]["full"] && 
                <React.Fragment>
                    <label id="subsbox" title="Choose whether to create new subsplits for each game (Note: This setting will remove existing subsplits from your splits files if toggled on)">
                        <input type="checkbox" disabled={listItems.length < 2} htmlFor="subsbox" checked={outputSettings["toggleSettings"]["subs"]} onChange={(e) => toggleCheckbox("subs", e.target.checked)}/>
                        Create Subsplits for Each Game
                    </label>
                    <br/><br/>
                </React.Fragment>
                }
                
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
                        setValue: "",
                        disableCon: listItems.length < 2,
                        updateKey: "setup",
                        updateFunction: addParamaterToText,
                        canClickToRefresh: true,
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
                {outputSettings["toggleSettings"]["subs"] && outputSettings["toggleSettings"]["full"] && 
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
                    description={"The template that will be used for the final subsplit in each game"}
                    dropDown={{
                        title: "Append Parameter",
                        setValue: "",
                        disableCon: listItems.length < 2,
                        updateKey: "final",
                        updateFunction: addParamaterToText,
                        canClickToRefresh: true,
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

                {/* Game Split Template */}
                {!outputSettings["toggleSettings"]["full"] && 
                <React.Fragment>
                <br/>
                <TextField
                    title={"Game's Split Name"}
                    unmaskCon={true}
                    moveCursorToEnd={false}
                    disableCon={listItems.length < 2}
                    placeholderText={"Template Text"}
                    changeableValue={outputSettings["templateText"]["final"]}
                    updateKey={"final"}
                    updateFunction={changeTemplateText}
                    description={"The template that will be used for each game's split"}
                    dropDown={{
                        title: "Append Parameter",
                        setValue: "",
                        disableCon: listItems.length < 2,
                        updateKey: "final",
                        updateFunction: addParamaterToText,
                        canClickToRefresh: true,
                        description: "Select parameters to add to the game split template",
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
            </details>

        </React.Fragment>

    )

}