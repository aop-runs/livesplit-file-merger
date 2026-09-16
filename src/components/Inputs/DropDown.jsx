import React from 'react'
import { IconButton } from '../Inputs/IconButton.jsx'
import { MdOutlinePlaylistRemove } from "react-icons/md";
import '../../styles/style.scss'

export const DropDown = ({ title, header, setValue, disableCon, updateKey, updateFunction, canClickToRefresh, description, choices, clearButton, shiftDropDown }) => {

    //Update value within dropdown and respetive state function
    const updateSelectValue = (name) => {
        updateKey !== undefined ? updateFunction(updateKey, name) : updateFunction(name)
    }
    const refreshSelectValue = (name) => {
        if(canClickToRefresh){
            updateKey !== undefined ? updateFunction(updateKey, name) : updateFunction(name)
        }
    }

    return (
        //Textfield with label and clear button
        <React.Fragment>
            {header !== undefined &&
                <React.Fragment>
                <label>{header}: </label><br/>
                </React.Fragment>
            }
            {shiftDropDown !== undefined && shiftDropDown == true &&
                <React.Fragment>
                <br/>
                </React.Fragment>
            }
            <select className="dropdown" value={setValue} disabled={disableCon} onChange={(e) => updateSelectValue(e.target.value)} title={description} onClick={(e) => refreshSelectValue(e.target.value)}>
                <option value="">{title}</option>
                {choices}
            </select>
            {clearButton !== undefined &&
                <IconButton
                    classes={"dropdown-clear-icon"}
                    action={clearButton.clearFunction}
                    description={clearButton.description}
                    icon={<MdOutlinePlaylistRemove />}
                />
            }
        </React.Fragment>
    )
}