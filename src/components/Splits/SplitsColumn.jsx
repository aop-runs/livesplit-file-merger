import React, { useCallback } from 'react';
import { AppSettings } from './AppSettings.jsx'
import { FileDownload } from './FileDownload.jsx'
import { FileUpload } from './FileUpload.jsx'
import { ItemList } from './ItemList.jsx'
import { defaultPBComp } from "../../utils/livesplit.js";
import '../../styles/style.scss'

export const SplitsColumn = ({ listItems, setListItems, addListItem, unmaskPaths, setUnmaskPaths, resetApplication, outputSettings, setOutputSettings, canDownload, updateCanDownload, finalOutput, setFinalOutput, checkGameComp, appStatuses, updateStatus }) => {

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

    //Add entry to list
    const addFileListItem = useCallback(
        (itemData) => {
            setListItems(listItems => {
                const updatedFiles = [...listItems]
                let newData = {...itemData}
                if("id" in itemData){
                    delete newData.id
                    newData.initialRepeats = findRepeats(newData.runName)
                }
                updatedFiles.push({
                    ...{id: listItems.length+1},
                    ...newData
                })
                refreshComparisons(updatedFiles)
                return updatedFiles
            })
        },
        [listItems],
    )

    //Get number of repeated run names
    const findRepeats = (runName) => {
        let count = listItems.filter(item => item.runName == runName).length
        if(count != 0){
            while(true){
                if(listItems.filter(item => item.runName == runName && item.initialRepeats == count).length == 0){
                    break
                }
                else{
                    count++
                }
            }
        }
        return count
    }

return (
        <React.Fragment>
        <AppSettings
            unmaskPaths={unmaskPaths}
            setUnmaskPaths={setUnmaskPaths}
            resetApplication={resetApplication}
        />
        <br/>
        <FileUpload
            findRepeats={findRepeats}
            addListItem={addFileListItem}
            appStatuses={appStatuses}
            updateStatus={updateStatus}
        />
        <br/>
        <ItemList
            listItems={listItems}
            setListItems={setListItems}
            addListItem={addFileListItem}
            outputSettings={outputSettings}
            setOutputSettings={setOutputSettings}
            canDownload={canDownload}
            unmaskPaths={unmaskPaths}
            refreshComparisons={refreshComparisons}
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
        <a className = "web-link" href = "#top" title="Click here to go back to the top of the webpage">
            Back to Top
        </a>
        </React.Fragment>
    )
}