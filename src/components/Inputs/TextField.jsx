//Based on: https://www.geeksforgeeks.org/html/how-to-add-button-inside-an-input-field-in-html/
import React from 'react'
import { TiDeleteOutline } from "react-icons/ti";
import '../../styles/style.scss'

export const TextField = ({ title, unmaskCon, disableCon, placeholderText, changeableValue, updateFunction, description, defaultButton }) => {

    //Update value within textfield and respetive state function
    const updateFieldValue = (name, canChange) => {
        if(canChange){
            updateFunction(name)
        }
    }

    return (
        //Textfield with label and clear button
        <React.Fragment>
            <br/>
            <div title={description}>
                <label>{title}: </label><br/>
                <div className="textfield-wrapper">
                    <input type={unmaskCon ? "text" : "password"} disabled={disableCon} placeholder={placeholderText} value={changeableValue} onChange={(e) => updateFieldValue(e.target.value, true)}/>
                    <button className={changeableValue.length != 0 ? "textfield-active-button" : ""} disabled={disableCon || changeableValue.length == 0} onClick={() => updateFieldValue("", true)}>
                        <TiDeleteOutline />
                    </button>
                </div>
                <label className={"textfield-extra-button" + (disableCon ? " textfield-disabled-button" : " textfield-active-button")} onClick={() => updateFieldValue(defaultButton.function, !disableCon)} title={defaultButton.description}>
                    {defaultButton.icon}
                </label>
            </div>
        </React.Fragment>
    )
}