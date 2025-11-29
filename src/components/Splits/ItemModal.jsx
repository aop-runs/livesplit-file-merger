import React from 'react'
import { openContentsInNewTab } from '../../utils/file.js'
import '../../styles/style.css'

export const ItemModal = ({ itemData, unmaskPaths, closeModal }) => {
    
    return (
            //Modal div upon item click
            <React.Fragment>
                <div className="modal">
                    <div className="entry">
                        <h3>{itemData.runName}</h3>
                        <p>Filename: {itemData.filename}</p>
                        <p>Starting Layout: {itemData.layoutPath.length != 0 ? (unmaskPaths ? itemData.layoutPath : "*".repeat(itemData.layoutPath.length)) : "N/A"}</p>
                        <p>Starting Offset: {itemData.offset}</p>
                        <button type ='button' onClick={() => openContentsInNewTab(itemData.contents, itemData.layoutPath, !unmaskPaths)}>Open Splits Contents</button>
                        <button type ='button' onClick={closeModal}>Close Modal</button>
                    </div>
                </div>
            </React.Fragment>
        )
    }