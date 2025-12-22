import React from 'react'
import { MdOutlinePlaylistRemove } from "react-icons/md";
import '../../styles/style.scss'

export const DropDown = ({ title, setValue, disableCon, updateKey, updateFunction, description, choices, clearButton }) => {

    //Update value within dropdown and respetive state function
    const updateSelectValue = (name) => {
        updateKey !== undefined ? updateFunction(updateKey, name) : updateFunction(name)
    }
    const refreshSelectValue = (name) => {
        updateKey !== undefined ? updateFunction(updateKey, name) : updateFunction(name)
    }

    return (
        //Textfield with label and clear button
        <React.Fragment>
            <select className="dropdown" value={setValue} disabled={disableCon} onChange={(e) => updateSelectValue(e.target.value)} title={description} onClick={(e) => refreshSelectValue(e.target.value)}>
                <option value="">{title}</option>
                {choices}
            </select>
            {clearButton !== undefined &&
                <button className = "dropdown-clear-icon" onClick={clearButton.clearFunction} title={clearButton.description}>
                    <MdOutlinePlaylistRemove />
                </button>
            }
        </React.Fragment>
    )
}