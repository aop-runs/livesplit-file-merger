import React from 'react'
import '../styles/style.scss'

export const StatusBox = ({ header, message, hideStatus }) => {
    
    return (
            //Modal div upon item click
            <React.Fragment>
                <div className="status" title="Status tab">
                    <h4 title="Status header">
                        {header}
                    </h4>
                    {message.map((line, index) => (
                        <p title="Status text"key={index}>
                            {line}
                        </p>
                    ))}
                    <button type ='button' onClick={hideStatus} title="Close this status tab">
                        Hide Status
                    </button>
                </div>
            </React.Fragment>
        )
    }