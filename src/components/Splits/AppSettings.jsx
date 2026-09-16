import React from 'react'
import { DropDown } from '../Inputs/DropDown.jsx'
import {IconButton } from '../Inputs/IconButton.jsx'
import { MdOutlineResetTv } from "react-icons/md";

export const AppSettings = ({ unmaskPaths, setUnmaskPaths, updateTheme, resetApplication }) => {

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
                <label title="Switch theme used for application">
                    Website Theme:
                </label><br/>
                <DropDown
                    title={"Browser (Default)"}
                    description={"Current theme used for application"}
                    updateFunction={updateTheme}
                    canClickToRefresh={false}
                    choices={["Light Mode", "Dark Mode"].map((t, index) => {
                        return (
                            <option key={index} value={t}>
                                {t}
                            </option>
                        );
                    })}
                />
                <br/><br/>
                <label id="unmask" title="Choose whether to unhide absolute filepath names for LiveSplit layouts">
                    <input type="checkbox" htmlFor="unmask" checked={unmaskPaths} onChange={(e) => updatePathUnmasking(e.target.checked)}/>
                    Unmask Filepaths
                </label>
                <IconButton
                    classes={"reset-button"}
                    action={resetApplication}
                    description={"Remove all entries and revert all settings to default"}
                    icon={<MdOutlineResetTv />}
                />
                <br/>
            </details>
        </React.Fragment>
    )
}