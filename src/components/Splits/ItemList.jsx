//Based on: https://medium.com/@liadshiran92/easy-drag-and-drop-in-react-22778b30ba37
import React from 'react'
import { Item } from './Item'
import { FaSortAlphaUp, FaSortAlphaDownAlt, FaSortAmountDown } from "react-icons/fa";
import '../../styles/style.scss'

export const ItemList = ({ listItems, unmaskPaths, moveListItem, removeListItem, reverseEntries, sortEntries }) => {

    return (
            <React.Fragment> 
                {/* List of items */}
                <details open title="Click to open/close this section">
                    <summary className ="sectionTitle">
                        Split Entries
                    </summary>
                    {listItems.length != 0 &&
                        <React.Fragment>
                        <br/>
                        <div className="list-box" title="All entries for LiveSplit files that will be included for your output splits in order">{listItems.map((file, index) => (
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
                        </React.Fragment>
                    }                 

                    {/* Buttons for list reordering */}
                    <label title="Number of files used for output splits">
                        Entries: {listItems.length}
                    </label><br/>
                    <button className = {"list-icon" + (listItems.length < 2 ? " list-icon-disabled" : " list-icon-active")} disabled={listItems.length < 2} onClick={reverseEntries} title="Reverses all of your entries">
                        <FaSortAmountDown />
                    </button>
                    <button className = {"list-icon" + (listItems.length < 2 ? " list-icon-disabled" : " list-icon-active")} disabled={listItems.length < 2} onClick={() => sortEntries(false)} title="Sort all of your entries A-Z">
                        <FaSortAlphaUp />
                    </button>
                    <button className = {"list-icon" + (listItems.length < 2 ? " list-icon-disabled" : " list-icon-active")} disabled={listItems.length < 2} onClick={() => sortEntries(true)} title="Sort all of your entries Z-A">
                        <FaSortAlphaDownAlt />
                    </button>
                </details>
            </React.Fragment>
        )
    }