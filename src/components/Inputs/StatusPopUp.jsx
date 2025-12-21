import React from 'react'
import '../../styles/style.scss'

export const StatusPopUp = ({ header, message }) => {
    
    //Get respective color for pop up header
    const getColorClass = (header) => {
        switch(header) {
            case "Error":
                return "status-red"
            case "Success":
                return "status-green"
            case "Warning":
                return "status-yellow"
            default:
                return "status-blue"
        }
    }

return (
        //Modal div upon item click
        <React.Fragment>
            <div className={"status " + getColorClass(header)} title="Status Pop-Up">
                <label className="status-header">
                    {header}:
                </label><br/>
                {message.map((line, index) => (
                    <label key={index}>
                        {line}<br/>
                    </label>
                ))}
            </div>
        </React.Fragment>
    )
}