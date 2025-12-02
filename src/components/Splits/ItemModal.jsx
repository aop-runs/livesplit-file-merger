import React from 'react'
import { openContentsInNewTab } from '../../utils/file.js'
import '../../styles/style.css'

export const ItemModal = ({ itemData, index, unmaskPaths, closeModal }) => {
    
    return (
            //Modal div upon item click
            <React.Fragment>
                <div className="modal" title="Important information tracked from this LiveSplit file">
                    <div className="entry">
                        <h3 title="Full run name for this entry">
                            {(index + 1).toString() + ". " + itemData.runName}
                        </h3>
                        <p title="Splits filename for this entry">
                            Filename: {itemData.filename}
                        </p>
                        <p title="Starting layout's filepath for this entry">
                            Starting Layout: {itemData.layoutPath.length != 0 ? (unmaskPaths ? itemData.layoutPath : "*".repeat(itemData.layoutPath.length)) : "N/A"}
                        </p>
                        <p title="Starting timer's offset for this entry">
                            Starting Offset: {itemData.offset}
                        </p>
                        <button title="Open raw contents for this entry" type ='button' onClick={() => openContentsInNewTab(itemData.contents, itemData.layoutPath, !unmaskPaths)}>
                            Open Splits Contents
                        </button>
                        <button title="Close this entry's information modal" type ='button' onClick={closeModal}>
                            Close Modal
                        </button>
                    </div>
                </div>
            </React.Fragment>
        )
    }