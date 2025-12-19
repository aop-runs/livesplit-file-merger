//Based on: https://www.geeksforgeeks.org/html/how-to-add-button-inside-an-input-field-in-html/ & https://www.geeksforgeeks.org/reactjs/how-to-get-the-enter-key-in-reactjs/
import React from 'react'
import { DropDown } from '../Inputs/DropDown.jsx'
import { HiArrowPath } from "react-icons/hi2";
import { TiDeleteOutline } from "react-icons/ti";
import '../../styles/style.scss'

export const TextField = ({ title, unmaskCon, disableCon, placeholderText, changeableValue, updateKey, updateFunction, enterFunction, description, defaultButton, dropDown }) => {

    //Update value within textfield and respetive state function
    const updateFieldValue = (name, canChange) => {
        if(canChange){
            updateKey !== undefined ? updateFunction(updateKey, name) : updateFunction(name)
        }
    }

    //Run a requested function if the user has prsssed enter
    const checkForEnter = (pressedKey) => {
        if(changeableValue.length != 0 && pressedKey == "Enter" && enterFunction !== undefined){
            enterFunction()
        }
    }

    return (
        //Textfield with label and clear button
        <React.Fragment>
            <div title={description}>
                <label>{title}: </label><br/>
                <div className="textfield-wrapper">
                    <input type={unmaskCon ? "text" : "password"} disabled={disableCon} placeholder={placeholderText} value={changeableValue} onChange={(e) => updateFieldValue(e.target.value, true)} onKeyDown={(e) => checkForEnter(e.key)}/>
                    <button className={changeableValue.length != 0 ? "textfield-active-button" : ""} disabled={disableCon || changeableValue.length == 0} onClick={() => updateFieldValue("", true)}>
                        <TiDeleteOutline />
                    </button>
                </div>
                {defaultButton !== undefined &&
                    <label className={"textfield-extra-button" + (disableCon ? " textfield-disabled-button" : " textfield-active-button")} onClick={() => updateFieldValue(defaultButton.function, !disableCon)} title={defaultButton.description}>
                        <HiArrowPath />
                    </label>
                }
                {dropDown !== undefined &&
                    <DropDown
                        title={dropDown.title}
                        setValue={""}
                        disableCon={disableCon}
                        updateKey={updateKey}
                        updateFunction={dropDown.updateFunction}
                        description={dropDown.description}
                        choices={dropDown.choices}
                    />
                }
            </div>
        </React.Fragment>
    )
}