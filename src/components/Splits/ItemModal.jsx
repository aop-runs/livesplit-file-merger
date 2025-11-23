import React from 'react'
import '../../styles/style.css'
import { openContentsInNewTab } from '../../utils/file.js'

export const ItemModal = ({  name, contents, closeModal }) => {
    
    return (
            //Modal div upon item click
            <React.Fragment>
                <div className="modal">
                    <div className="entry">
                        <h3>Filename: {name}</h3>
                        <button type ='button' onClick={() => openContentsInNewTab(contents)}>Open Splits Contents</button>
                        <button type ='button' onClick={closeModal}>Close Modal</button>
                    </div>
                </div>
            </React.Fragment>
        )
    }