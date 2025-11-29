import React from 'react'
import '../../styles/style.css'
import { openContentsInNewTab } from '../../utils/file.js'

export const ItemModal = ({ itemData, closeModal }) => {
    
    return (
            //Modal div upon item click
            <React.Fragment>
                <div className="modal">
                    <div className="entry">
                        <h3>{itemData.runName}</h3>
                        <p>Filename: {itemData.filename}</p>
                        <p>Starting Layout: {itemData.layoutPath.length != 0 ? itemData.layoutPath : "N/A"}</p>
                        <p>Starting Offset: {itemData.offset}</p>
                        <button type ='button' onClick={() => openContentsInNewTab(itemData.contents)}>Open Splits Contents</button>
                        <button type ='button' onClick={closeModal}>Close Modal</button>
                    </div>
                </div>
            </React.Fragment>
        )
    }