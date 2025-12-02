import React, {  } from 'react'
import { Item } from './Item'
import '../../styles/style.css'

export const ItemList = ({ listItems, unmaskPaths, moveListItem, removeListItem, reverseEntries, sortEntries }) => {

    return (
            
            //List of Items
            <React.Fragment>
                
            <div className="entry" title="All entries for LiveSplit files that will be included for your output splits in order">{listItems.map((file, index) => (
                <Item
                    key={file.id}
                    index={index}
                    listSize={listItems.length}
                    unmaskPaths={unmaskPaths}
                    itemData={file}
                    moveListItem={moveListItem}
                    removeListItem={removeListItem}
                />
            ))}
            </div>
            <label title="Number of files used for output splits">
                Entries: {listItems.length}
            </label>
            <button type="button" onClick={reverseEntries} disabled={listItems.length==0} title="Reverses the order of all of your entries">
                Reverse Entries
            </button>
            <button type="button" onClick={() => sortEntries(false)} disabled={listItems.length==0} title="Sort all of your entries A-Z">
                Sort Entries A-Z
            </button>
            <button type="button" onClick={() => sortEntries(true)} disabled={listItems.length==0} title="Sort all of your entries Z-A">
                Sort Entries Z-A
            </button>

            </React.Fragment>
        )
    }