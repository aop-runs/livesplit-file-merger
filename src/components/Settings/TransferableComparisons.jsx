import React from 'react'
import { StatusPopUp } from '../Inputs/StatusPopUp.jsx'
import { BsList } from "react-icons/bs";
import { TbListCheck } from "react-icons/tb";
import '../../styles/style.scss'

export const TransferableComparisons = ({ listItems, outputSettings, setOutputSettings, checkGameComp, appStatuses, updateStatus }) => {

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
    const checkIfAllComparisonsChecked = (check) => {
        return (listItems.length < 2 || outputSettings["usedComparisons"].length == 0 || (Array.from(new Set(outputSettings["usedComparisons"].map((comp) => {return comp.used})))[0] == check && new Set(outputSettings["usedComparisons"].map((comp) => {return comp.used})).size == 1))
    }

    //Toggle checkbox
    const toggleCheckbox = (key, value) => {
        setOutputSettings(outputSettings => {
            const updatedSettings = {...outputSettings}
            updatedSettings["toggleSettings"][key] = value
            return updatedSettings
        })
        if(key == "comp"){
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
    }

    return (
    
        <React.Fragment>
            
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
                        <label>Comparisons:</label>
                        {!checkIfAllComparisonsChecked(true) &&
                            <button className = "comparison-icon comparison-icon-1" onClick={() => toggleAllComparisons(true)} title="Toogle all above comparison settings on">
                                <TbListCheck />
                            </button>
                        }
                        {!checkIfAllComparisonsChecked(false) &&
                            <button className = {"comparison-icon " + (!checkIfAllComparisonsChecked(true) && !checkIfAllComparisonsChecked(false) ? "comparison-icon-2" : "comparison-icon-1")} onClick={() => toggleAllComparisons(false)} title="Toogle all above comparison settings off">
                                <BsList />
                            </button>
                        }
                        <br/>
                        {outputSettings["usedComparisons"].map((comp, index) => {
                            return (
                                <label id={comp.name} key={index}>
                                    <input type="checkbox" disabled={listItems.length < 2} htmlFor={comp.name} checked={comp.used} onChange={(e) => toggleComparison(index, e.target.checked)}/>
                                    {comp.name}<br/>
                                </label>
                            );
                        })}
                        
                    </div>
                }
            </details>

        </React.Fragment>

    )

}