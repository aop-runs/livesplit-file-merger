import React from 'react'
import '../../styles/style.scss'

export const TimingMethods = ({ listItems, outputSettings, setOutputSettings }) => {

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

    return (
    
        <React.Fragment>

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
            </details>

        </React.Fragment>

    )

}