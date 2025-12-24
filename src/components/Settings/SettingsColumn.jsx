import React from 'react'
import { OutputSettings } from './OutputSettings.jsx'
import '../../styles/style.scss'

export const SettingsColumn = ({ listItems, unmaskPaths, updateCanDownload, outputSettings, setOutputSettings, requestData, setRequestData, checkGameComp, appStatuses, updateStatus }) => {
    
return (
        <React.Fragment>
            <OutputSettings
                listItems={listItems}
                unmaskPaths={unmaskPaths}
                updateCanDownload={updateCanDownload}
                outputSettings={outputSettings}
                setOutputSettings={setOutputSettings}
                requestData={requestData}
                setRequestData={setRequestData}
                checkGameComp={checkGameComp}
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