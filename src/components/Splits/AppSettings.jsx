import React from 'react'
import { MdOutlineResetTv } from "react-icons/md";

export const AppSettings = ({ unmaskPaths, setUnmaskPaths, resetApplication }) => {

    return (
        <React.Fragment>
            <details open title="Click to open/close this section">
                <summary className="sectionTitle">
                    Application Settings
                </summary>
                <label id="unmask" title="Choose whether to unhide absolute filepath names for LiveSplit layouts">
                    <input type="checkbox" htmlFor="unmask" checked={unmaskPaths} onChange={(e) => setUnmaskPaths(e.target.checked)}/>
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