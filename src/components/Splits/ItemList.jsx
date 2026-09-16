//Based on: https://stackblitz.com/edit/vitejs-vite-yq3sun?file=src%2FApp.jsx
import React, { useCallback } from 'react';
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { FaSortAlphaUp, FaSortAlphaDownAlt, FaSortAmountDown } from "react-icons/fa";
import { GoTrash } from "react-icons/go";
import { GrDuplicate } from "react-icons/gr";
import { RiCheckboxMultipleLine, RiCheckboxMultipleBlankLine } from "react-icons/ri";
import { Item } from './Item.jsx'
import '../../styles/style.scss'

export const ItemList = ({ listItems, setListItems, addListItem, outputSettings, setOutputSettings, canDownload, unmaskPaths, refreshComparisons }) => {

    //Pre-included sensors for drag operations
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {}
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    //Pre-included functionality to end
    const handleDragEnd = ({ active, over }) => {
        if (!over || active.id == over.id) {
            return;
        }
        setListItems((listItems) => {
            let updatedFiles = [...listItems]
            updatedFiles = arrayMove(
                updatedFiles,
                updatedFiles.findIndex((it) => it.id == active.id),
                updatedFiles.findIndex((it) => it.id == over.id)
            );
            if(outputSettings["entryIndex"] == over.id - 1 || outputSettings["entryIndex"] == active.id - 1){
                setOutputSettings(outputSettings => {
                    const updatedSettings = {...outputSettings}
                    if(!updatedSettings["toggleSettings"]["same"]){
                        updatedSettings["setupTime"] = updatedFiles[active.id < over.id ? over.id - 1 : active.id - 1].setup
                    }
                    return updatedSettings
                })
            }
            refreshComparisons(updatedFiles)
            return updatedFiles
        });
    };

//Move item inside list
const moveFileListItem = useCallback(
    (oldIndex, newIndex) => {
        setListItems(listItems => {
            const updatedFiles = [...listItems]
            updatedFiles[oldIndex] = listItems[newIndex]
            updatedFiles[newIndex] = listItems[oldIndex]
            if(outputSettings["entryIndex"] == newIndex || outputSettings["entryIndex"] == oldIndex){
                setOutputSettings(outputSettings => {
                    const updatedSettings = {...outputSettings}
                    if(!updatedSettings["toggleSettings"]["same"]){
                        updatedSettings["setupTime"] = updatedFiles[oldIndex < newIndex ? newIndex : oldIndex].setup
                    }
                    return updatedSettings
                })
            }
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
            setOutputSettings(outputSettings => {
                const updatedSettings = {...outputSettings}
                if(!updatedSettings["toggleSettings"]["same"]){
                    if(index == updatedSettings["entryIndex"]){
                        updatedSettings["setupTime"] = updatedFiles[index != 0 ? updatedSettings["entryIndex"] - 1 : updatedSettings["entryIndex"]].setup
                        updatedSettings["entryIndex"] = index != 0 ? updatedSettings["entryIndex"] - 1 : updatedSettings["entryIndex"]
                    }
                    else if(index < updatedSettings["entryIndex"]){
                        updatedSettings["setupTime"] = updatedFiles[updatedSettings["entryIndex"] - 1].setup
                        updatedSettings["entryIndex"] -= 1
                    }
                }
                return updatedSettings
            })
            refreshComparisons(updatedFiles)
            return updatedFiles
        })
    },
    [listItems],
)

//Toggle selection for current entry
const toggleFileListItemSelection = useCallback(
    (index, value) => {
        setListItems(listItems => {
            const updatedFiles = [...listItems]
            updatedFiles[index].isSelected = value
            return updatedFiles
        })
    },
    [listItems],
)

//Toggle selection for all entries
const toggleAllItemSelection =
    (value) => {
        for(let i = 0; i < listItems.length; i++) {
            toggleFileListItemSelection(i, value)
        }
    }

//Add duplicate entries for all selected items
const addAllSelectedItems = 
    () => {
        for(let i = 0; i < listItems.length; i++) {
            if(listItems[i].isSelected){
                addListItem(listItems[i])
            }
        }
    }

//Remove all selected items
const removeAllSelectedItems = 
    () => {
        if(confirm("Are you sure you want to remove all of your currently selected entries?")){
            for(let i = listItems.length - 1; i >= 0; i--) {
                if(listItems[i].isSelected){
                    removeFileListItem(i)
                }
            }
        }
    }

//Reverse entries
const reverseEntries = useCallback(
    () => {
        setListItems(listItems => {
            const updatedFiles = [...listItems]
            updatedFiles.reverse()
            for(let i = 0; i < updatedFiles.length; i++) {
                updatedFiles[i].id = i+1;
            }
            setOutputSettings(outputSettings => {
                const updatedSettings = {...outputSettings}
                if(!updatedSettings["toggleSettings"]["same"]){
                    updatedSettings["setupTime"] = updatedFiles[updatedSettings["entryIndex"]].setup
                }
                return updatedSettings
            })
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
            if(!reversed){
                updatedFiles.sort((a, b) => compare(a.runName, b.runName) || a.initialRepeats - b.initialRepeats);
            }
            else{
                updatedFiles.sort((a, b) => compare(b.runName, a.runName) || b.initialRepeats - a.initialRepeats);
            }
            for(let i = 0; i < updatedFiles.length; i++) {
                updatedFiles[i].id = i+1;
            }
            setOutputSettings(outputSettings => {
                const updatedSettings = {...outputSettings}
                if(!updatedSettings["toggleSettings"]["same"]){
                    updatedSettings["setupTime"] = updatedFiles[updatedSettings["entryIndex"]].setup
                }
                return updatedSettings
            })
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

                {/* Number of items and slected entries if any exist */}
                <br/><label title="Number of files used for output splits">
                    Entries: {listItems.length}
                </label>
                {listItems.reduce((count, item) => item.isSelected == true ? count + 1 : count, 0) != 0 &&
                    <label title="Number of entries selected">
                        {(" (" + (listItems.reduce((count, item) => item.isSelected == true ? count + 1 : count, 0) == listItems.length ? "All" : listItems.reduce((count, item) => item.isSelected == true ? count + 1 : count, 0)) + " Entr" + (listItems.reduce((count, item) => item.isSelected == true ? count + 1 : count, 0) == 1 ? "y" : "ies") + " Selected)")}
                    </label>
                }<br/>
                
                {listItems.length != 0 &&
                    <React.Fragment>
                    
                    {/* Buttons for entry selection */}
                    <button className = {"list-icon" + (listItems.reduce((count, item) => item.isSelected == true ? count + 1 : count, 0) == 0 ? " list-icon-disabled" : " list-icon-active")} disabled={listItems.reduce((count, item) => item.isSelected == true ? count + 1 : count, 0) == 0} onClick={() => toggleAllItemSelection(false)} title="Unselect all of your entries">
                        <RiCheckboxMultipleBlankLine />
                    </button>
                    <button className = {"list-icon" + (listItems.reduce((count, item) => item.isSelected == true ? count + 1 : count, 0) == listItems.length ? " list-icon-disabled" : " list-icon-active")} disabled={listItems.reduce((count, item) => item.isSelected == true ? count + 1 : count, 0) == listItems.length} onClick={() => toggleAllItemSelection(true)} title="Select all of your entries">
                        <RiCheckboxMultipleLine />
                    </button>
                    <button className = {"list-icon" + (listItems.reduce((count, item) => item.isSelected == true ? count + 1 : count, 0) == 0 ? " list-icon-disabled" : " list-icon-active")} disabled={listItems.reduce((count, item) => item.isSelected == true ? count + 1 : count, 0) == 0} onClick={addAllSelectedItems} title="Add a duplicate of all selected items to the end of your entries">
                        <GrDuplicate />
                    </button>
                    <button className = {"list-icon" + (listItems.reduce((count, item) => item.isSelected == true ? count + 1 : count, 0) == 0 ? " list-icon-disabled" : " list-icon-active")} disabled={listItems.reduce((count, item) => item.isSelected == true ? count + 1 : count, 0) == 0} onClick={removeAllSelectedItems} title="Remove all selected items from your entries">
                        <GoTrash />
                    </button><br/>

                    {/* Box where all entries are located */}
                    <br/>
                    <div className="list-box" title="All entries for LiveSplit files that will be included for your output splits in order">
                    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                        <SortableContext items={listItems} strategy={rectSortingStrategy}>
                        {listItems.map((file, index) => (
                            <Item
                                key={file.id}
                                id={file.id} 
                                index={index}
                                listSize={listItems.length}
                                unmaskPaths={unmaskPaths}
                                canDownload={canDownload}
                                itemData={file}
                                moveListItem={moveFileListItem}
                                addListItem={addListItem}
                                removeListItem={removeFileListItem}
                                toggleListItemSelection={toggleFileListItemSelection}
                            />
                        ))}
                        </SortableContext>
                    </DndContext>
                    </div>

                    {/* Buttons for list reordering */}
                    <br/>
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
  );
}
