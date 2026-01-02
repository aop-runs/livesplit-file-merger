import React from 'react'
import { MdOutlineResetTv } from "react-icons/md";

export const AppSettings = ({ unmaskPaths, setUnmaskPaths, resetApplication }) => {

    //Update whether to unmask filepaths
    const updatePathUnmasking = (value) => {
        if(!value || confirm("Are you sure you want to unmask the names of filepaths that will be uploaded from your files? Make sure you are not streaming or using a virtual camera when using this tool.")){
            setUnmaskPaths(value)
        }
    }

    return (
        <React.Fragment>
            <details open title="Click to open/close this section">
                <summary className="sectionTitle">
                    Application Settings
                </summary>
                <label id="unmask" title="Choose whether to unhide absolute filepath names for LiveSplit layouts">
                    <input type="checkbox" htmlFor="unmask" checked={unmaskPaths} onChange={(e) => updatePathUnmasking(e.target.checked)}/>
                    Unmask Filepaths
                </label>
                <button className="reset-button" type="button" onClick={resetApplication} title="Remove all entries and revert all settings to default">
                    <MdOutlineResetTv />
                </button>
                <br/>
            </details>
        </React.Fragment>
    )
}