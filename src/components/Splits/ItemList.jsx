//Based on: https://medium.com/@liadshiran92/easy-drag-and-drop-in-react-22778b30ba37
import React, { useCallback } from 'react'
import { Item } from './Item'
import { FaSortAlphaUp, FaSortAlphaDownAlt, FaSortAmountDown } from "react-icons/fa";
import '../../styles/style.scss'

export const ItemList = ({ listItems, setListItems, unmaskPaths, refreshComparisons }) => {

    //Pre-included move function
    const moveFileListItem = useCallback(
        (dragIndex, hoverIndex) => {
            const dragItem = listItems[dragIndex]
            const hoverItem = listItems[hoverIndex]
            // Swap places of dragItem and hoverItem in the files array
            setListItems(listItems => {
                const updatedFiles = [...listItems]
                updatedFiles[dragIndex] = hoverItem
                updatedFiles[hoverIndex] = dragItem
                refreshComparisons(updatedFiles)
                return updatedFiles
            })
        },
        [listItems],
    )

    //Remove entry from list and refresh keys
    const removeFileListItem = useCallback(
        (index) => {
            setListItems(listItems => {
                const updatedFiles = [...listItems]
                updatedFiles.splice(index, 1)
                for(let i = 0; i < updatedFiles.length; i++) {
                    updatedFiles[i].id = i+1;
                }
                refreshComparisons(updatedFiles)
                return updatedFiles
            })
        },
        [listItems],
    )

    //Reverse entries
    const reverseEntries = useCallback(
        () => {
            setListItems(listItems => {
                const updatedFiles = [...listItems]
                updatedFiles.reverse()
                for(let i = 0; i < updatedFiles.length; i++) {
                    updatedFiles[i].id = i+1;
                }
                refreshComparisons(updatedFiles)
                return updatedFiles
            })
        },
        [listItems],
    )

    //Sort entries
    const sortEntries = useCallback(
        (reversed) => {
            setListItems(listItems => {
                const updatedFiles = [...listItems]
                const { compare } = Intl.Collator('en-US');
                updatedFiles.sort((a, b) => compare(a.runName, b.runName));
                if(reversed){
                    updatedFiles.reverse()
                }
                for(let i = 0; i < updatedFiles.length; i++) {
                    updatedFiles[i].id = i+1;
                }
                refreshComparisons(updatedFiles)
                return updatedFiles
            })
        },
        [listItems],
    )

    return (
            <React.Fragment> 
                {/* List of items */}
                <details open title="Click to open/close this section">
                    <summary className ="sectionTitle">
                        Split Entries
                    </summary>
                    <br/><label title="Number of files used for output splits">
                        Entries: {listItems.length}
                    </label><br/>
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
                                moveListItem={moveFileListItem}
                                removeListItem={removeFileListItem}
                            />
                        ))}
                        </div>
                        <br/>
                        {/* Buttons for list reordering */}
                        <button className = {"list-icon" + (listItems.length < 2 ? " list-icon-disabled" : " list-icon-active")} disabled={listItems.length < 2} onClick={reverseEntries} title="Reverses all of your entries">
                            <FaSortAmountDown />
                        </button>
                        <button className = {"list-icon" + (listItems.length < 2 ? " list-icon-disabled" : " list-icon-active")} disabled={listItems.length < 2} onClick={() => sortEntries(false)} title="Sort all of your entries A-Z">
                            <FaSortAlphaUp />
                        </button>
                        <button className = {"list-icon" + (listItems.length < 2 ? " list-icon-disabled" : " list-icon-active")} disabled={listItems.length < 2} onClick={() => sortEntries(true)} title="Sort all of your entries Z-A">
                            <FaSortAlphaDownAlt />
                        </button><br/>
                        </React.Fragment>
                    }
                </details>
            </React.Fragment>
        )
    }