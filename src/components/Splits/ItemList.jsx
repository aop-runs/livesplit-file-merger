//Based on: https://stackblitz.com/edit/vitejs-vite-yq3sun?file=src%2FApp.jsx
import React, { useCallback } from 'react';
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { FaSortAlphaUp, FaSortAlphaDownAlt, FaSortAmountDown } from "react-icons/fa";
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

//Pre-included move function
const moveFileListItem = useCallback(
    (oldIndex, newIndex) => {
        const oldItem = listItems[oldIndex]
        const newItem = listItems[newIndex]
        setListItems(listItems => {
            const updatedFiles = [...listItems]
            updatedFiles[oldIndex] = newItem
            updatedFiles[newIndex] = oldItem
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
            updatedFiles.sort((a, b) => compare(a.runName, b.runName));
            if(reversed){
                updatedFiles.reverse()
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
                <br/><label title="Number of files used for output splits">
                    Entries: {listItems.length}
                </label><br/>
                {listItems.length != 0 &&
                    <React.Fragment>
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
