import React from 'react'
import '../../styles/style.css'

export const StatusBox = ({ header, message, hideStatus }) => {
    
    return (
            //Modal div upon item click
            <React.Fragment>
                <div className="entry">
                    <h3>{header}</h3>
                    {message.map((line, index) => (
                        <p key={index}>{line}</p>
                    ))}
                    <button type ='button' onClick={hideStatus}>Hide Status</button>
                </div>
            </React.Fragment>
        )
    }