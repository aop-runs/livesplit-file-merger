//Based on: https://www.geeksforgeeks.org/html/how-to-add-button-inside-an-input-field-in-html/ & https://www.geeksforgeeks.org/reactjs/how-to-get-the-enter-key-in-reactjs/
import React, { useRef } from 'react'
import { DropDown } from '../Inputs/DropDown.jsx'
import { HiArrowPath } from "react-icons/hi2";
import { TiDeleteOutline } from "react-icons/ti";
import '../../styles/style.scss'

export const TextField = ({ title, unmaskCon, moveCursorToEnd, disableCon, placeholderText, changeableValue, updateKey, updateFunction, enterFunction, description, defaultButton, miscButton, dropDown }) => {
    
    //Set cursor position to end of textfield every click
    const inputRef = useRef(null);
    const setCursorToEnd = () => {
        if(moveCursorToEnd && inputRef.current) {
            inputRef.current.setSelectionRange(changeableValue.length, changeableValue.length);
        }
    }

    //Update value within textfield and respetive state function
    const updateFieldValue = (value, canChange) => {
        if(canChange){
            updateKey !== undefined ? updateFunction(updateKey, value) : updateFunction(value)
        }
    }

    //Run a requested function if the user has prsssed enter
    const checkForKey = (pressedKey) => {
        if(enterFunction !== undefined && enterFunction.enableCon && pressedKey == "Enter"){
            enterFunction.function()
        }
        else if(changeableValue.length != 0 && pressedKey == "Delete"){
            updateKey !== undefined ? updateFunction(updateKey, "") : updateFunction("")
        }
    }

    return (
        //Textfield with label and clear button
        <React.Fragment>
            <div title={description}>
                <label>{title}: </label><br/>
                <div className="textfield-wrapper">
                    <input ref={inputRef} type={unmaskCon ? "text" : "password"} disabled={disableCon} placeholder={placeholderText} value={changeableValue} onChange={(e) => updateFieldValue(e.target.value, true)} onKeyDown={(e) => checkForKey(e.key)} onClick={setCursorToEnd}/>
                    <button className={changeableValue.length != 0 ? "textfield-active-button" : ""} disabled={disableCon || changeableValue.length == 0} onClick={() => updateFieldValue("", true)}>
                        <TiDeleteOutline />
                    </button>
                </div>
                {defaultButton !== undefined &&
                    <button className={"textfield-extra-button" + (disableCon ? " textfield-disabled-button" : " textfield-active-button")} onClick={() => updateFieldValue(defaultButton.value, !disableCon)} title={defaultButton.description}>
                        <HiArrowPath />
                    </button>
                }
                {miscButton !== undefined &&
                    <button className={"textfield-misc-button" + (miscButton.disableCon ? " textfield-disabled-button" : " textfield-active-button")} onClick={miscButton.function} title={miscButton.description}>
                        {miscButton.icon}
                    </button>
                }
                {dropDown !== undefined &&
                    <DropDown
                        title={dropDown.title}
                        setValue={""}
                        disableCon={disableCon}
                        updateKey={updateKey}
                        updateFunction={dropDown.updateFunction}
                        canClickToRefresh={true}
                        description={dropDown.description}
                        choices={dropDown.choices}
                    />
                }
            </div>
        </React.Fragment>
    )
}