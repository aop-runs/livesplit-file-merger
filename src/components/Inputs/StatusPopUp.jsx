import React from 'react'
import '../../styles/style.scss'

export const StatusBox = ({ header, message }) => {
    
return (
        //Modal div upon item click
        <React.Fragment>
            <div className="status" title="Status tab">
                <label className="status-header" title="Status header">
                    {header}
                </label><br/>
                {message.map((line, index) => (
                    <label title="Status text"key={index}>
                        {line}
                    </label>
                ))}<br/>
            </div>
        </React.Fragment>
    )
}