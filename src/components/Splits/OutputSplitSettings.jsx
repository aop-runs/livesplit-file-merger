import React, {  } from 'react'

export const OutputSplitSettings = ({ listItems, toggleSettings, setToggleSettings, initialStatus }) => {
    
    //Status box tracking

    //Toggle checkbox
    const toggleCheckbox = (key, value) => {
        setToggleSettings(customInfo => {
            const updatedCustomInfo = {...customInfo}
            updatedCustomInfo[key] = value
            return updatedCustomInfo
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

            </React.Fragment>
        )
    }