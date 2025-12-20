import React from 'react'
import { FaRegWindowClose } from "react-icons/fa";
import { openContentsInNewTab } from '../../utils/file.js'
import '../../styles/style.scss'

export const ItemModal = ({ itemData, index, unmaskPaths, closeModal }) => {
    
    return (
            //Modal div upon item click
            <React.Fragment>
                <div className="modal" title="Important information tracked from this LiveSplit file">
                    <div className="modal-entry">
                        <span className="modal-close-button" title="Close this entry's information modal" onClick={closeModal}>
                            <FaRegWindowClose />
                        </span>
                        <h3 title="Full run name for this entry">
                            {(index + 1).toString() + ". " + itemData.runName}
                        </h3>
                        <p title="Splits filename for this entry">
                            Filename:<br/>{itemData.filename}
                        </p>
                        <p title="Starting layout's filepath for this entry">
                            Starting Layout:<br/>{itemData.layoutPath.length != 0 ? (unmaskPaths ? itemData.layoutPath : itemData.layoutPath.length + " characters masked") : "N/A"}
                        </p>
                        <p title="Starting timer's offset for this entry">
                            Starting Offset:<br/>{itemData.offset}
                        </p>
                        <p title="Every segment comparison found for this entry">
                            Found Comparisons:<br/>{itemData.comparisons.length != 0 ? itemData.comparisons.join(", ") : "N/A"}
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