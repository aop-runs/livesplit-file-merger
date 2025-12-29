import React from 'react'
import { RunName } from './RunName.jsx'
import { OutputOptions } from './OutputOptions.jsx'
import { SplitTemplates } from './SplitTemplates.jsx'
import { StartingProperties } from './StartingProperties.jsx'
import { TimingMethods } from './TimingMethods.jsx'
import { TransferableComparisons } from './TransferableComparisons.jsx'
import '../../styles/style.scss'

export const SettingsColumn = ({ listItems, setListItems, unmaskPaths, canDownload, updateCanDownload, outputSettings, setOutputSettings, requestData, setRequestData, checkGameComp, appStatuses, updateStatus }) => {
    
return (
        <React.Fragment>
            <OutputOptions
                listItems={listItems}
                setListItems={setListItems}
                canDownload={canDownload}
                updateCanDownload={updateCanDownload}
                outputSettings={outputSettings}
                setOutputSettings={setOutputSettings}
                checkGameComp={checkGameComp}
                appStatuses={appStatuses}
                updateStatus={updateStatus}
            />
            <br/>
            <StartingProperties
                listItems={listItems}
                unmaskPaths={unmaskPaths}
                updateCanDownload={updateCanDownload}
                outputSettings={outputSettings}
                setOutputSettings={setOutputSettings}
                appStatuses={appStatuses}
                updateStatus={updateStatus}
            />
            <br/>
            <TransferableComparisons
                listItems={listItems}
                outputSettings={outputSettings}
                setOutputSettings={setOutputSettings}
                checkGameComp={checkGameComp}
                appStatuses={appStatuses}
                updateStatus={updateStatus}
            />
            <br/>
            <TimingMethods
                listItems={listItems}
                outputSettings={outputSettings}
                setOutputSettings={setOutputSettings}
            />
            <br/>
            <SplitTemplates
                listItems={listItems}
                outputSettings={outputSettings}
                setOutputSettings={setOutputSettings}
            />
            <br/>
            <RunName
                listItems={listItems}
                outputSettings={outputSettings}
                setOutputSettings={setOutputSettings}
                requestData={requestData}
                setRequestData={setRequestData}
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