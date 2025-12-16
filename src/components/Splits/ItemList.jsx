import React, {  } from 'react'
import { Item } from './Item'
import '../../styles/style.css'

export const ItemList = ({ listItems, unmaskPaths, updateCanDownload, outputSettings, moveListItem, removeListItem, reverseEntries, sortEntries, updateStatus }) => {

    return (
            
            <React.Fragment>
            
            {/* List of items */}
            <div className="entry" title="All entries for LiveSplit files that will be included for your output splits in order">{listItems.map((file, index) => (
                <Item
                    key={file.id}
                    index={index}
                    listSize={listItems.length}
                    unmaskPaths={unmaskPaths}
                    itemData={file}
                    updateCanDownload={updateCanDownload}
                    outputSettings={outputSettings}
                    listItems={listItems}
                    moveListItem={moveListItem}
                    removeListItem={removeListItem}
                    updateStatus={updateStatus}
                />
            ))}
            </div>

            {/* Buttons for list reordering */}
            <button type="button" onClick={reverseEntries} disabled={listItems.length < 2} title="Reverses the order of all of your entries">
                Reverse Entries
            </button>
            <button type="button" onClick={() => sortEntries(false)} disabled={listItems.length < 2} title="Sort all of your entries A-Z">
                Sort Entries A-Z
            </button>
            <button type="button" onClick={() => sortEntries(true)} disabled={listItems.length < 2} title="Sort all of your entries Z-A">
                Sort Entries Z-A
            </button>
            <br/><label title="Number of files used for output splits">
                Entries: {listItems.length}
            </label>

            </React.Fragment>
        )
    }