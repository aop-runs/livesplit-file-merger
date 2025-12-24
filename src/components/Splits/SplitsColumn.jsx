import React, { useCallback } from 'react'
import { FileDownload } from './FileDownload.jsx'
import { FileUpload } from './FileUpload.jsx'
import { ItemList } from './ItemList.jsx'
import { MdOutlineResetTv } from "react-icons/md";
import { defaultPBComp } from "../../utils/livesplit.js";
import '../../styles/style.scss'

export const SplitsColumn = ({ listItems, setListItems, unmaskPaths, setUnmaskPaths, resetApplication, outputSettings, setOutputSettings, canDownload, updateCanDownload, finalOutput, setFinalOutput, checkGameComp, appStatuses, updateStatus }) => {

    //Refresh all comparisons after list is modified
    const refreshComparisons = (listItems) => {
        setOutputSettings(outputSettings => {
            let updatedSettings = {...outputSettings}
            let searchedComp = []
            for(let file of Array.from(listItems).entries()){
                searchedComp = file[0] != 0 ? searchedComp.filter(name => file[1].comparisons.includes(name)) : [...file[1].comparisons]
            }
            updatedSettings["usedComparisons"] = searchedComp.filter(name => name != defaultPBComp).map(
                (comp) => {
                    let nameIndex = outputSettings["usedComparisons"].findIndex(c => c.name === comp)
                    return {name: comp, used: outputSettings["usedComparisons"].findIndex(c => c.name === comp) != -1 ? outputSettings["usedComparisons"][nameIndex].used : true}
                }
            )
            checkGameComp(updatedSettings)
            if(updatedSettings["usedComparisons"].length == 0 && listItems.length != 0){
                updateStatus("found", {
                    header: "Info",
                    message: ["No comparisons found that exist in each entry"]
                })
            }
            else{
                updateStatus("found")
            }
            return updatedSettings
        })
    }

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

    //Add entry to list
    const addFileListItem = useCallback(
        (itemData) => {
            setListItems(listItems => {
                const updatedFiles = [...listItems]
                updatedFiles.push({
                    ...{id: listItems.length+1},
                    ...itemData
                })
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
        <details open title="Click to open/close this section">
            <summary className="sectionTitle">
                Application Settings
            </summary>
            <label id="unmask" title="Choose whether to unhide absolute filepath names for LiveSplit layouts">
                <input type="checkbox" htmlFor="unmask" checked={unmaskPaths} onChange={(e) => setUnmaskPaths(e.target.checked)}/>
                Unmask Filepaths
            </label>
            <button className="reset-button" type="button" onClick={resetApplication} title="Remove all entries and revert all settings to default">
                <MdOutlineResetTv />
            </button>
            <br/>
        </details>
        <br/>
        <FileUpload
            addListItem={addFileListItem}
            appStatuses={appStatuses}
            updateStatus={updateStatus}
        />
        <br/>
        <ItemList
            listItems={listItems}
            unmaskPaths={unmaskPaths}
            moveListItem={moveFileListItem}
            removeListItem={removeFileListItem}
            reverseEntries={reverseEntries}
            sortEntries={sortEntries}
        />
        <br/>
        <FileDownload
            listItems={listItems}
            unmaskPaths={unmaskPaths}
            outputSettings={outputSettings}
            canDownload={canDownload}
            updateCanDownload={updateCanDownload}
            finalOutput={finalOutput}
            setFinalOutput={setFinalOutput}
            appStatuses={appStatuses}
            updateStatus={updateStatus}
        />
        <br/>
        <a className = "top-link" href = "#top" title="Click to go back to the top of the webpage">
            Back to Top
        </a>
        </React.Fragment>
    )
}