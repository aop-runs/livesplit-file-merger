import React from 'react'
import '../../styles/style.css'
import { openContentsInNewTab } from '../../utils/file.js'

export const ItemModal = ({ runName, filename, contents, closeModal }) => {
    
    return (
            //Modal div upon item click
            <React.Fragment>
                <div className="modal">
                    <div className="entry">
                        <h3>{runName}</h3>
                        <p>Filename: {filename}</p>
                        <button type ='button' onClick={() => openContentsInNewTab(contents)}>Open Splits Contents</button>
                        <button type ='button' onClick={closeModal}>Close Modal</button>
                    </div>
                </div>
            </React.Fragment>
        )
    }