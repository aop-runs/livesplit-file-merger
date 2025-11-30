import React from 'react'

export const OutputSettings = ({ listItems, unmaskPaths, useFirstInfo, setUseFirstInfo, customInfo, setCustomInfo }) => {
    
    //Toggle whether to use custom layout and filepath or ones from the first LiveSplit file
    const toggleFirstInfo = (value) => {
        setUseFirstInfo(value)
        if(!value && listItems.length != 0){
            setCustomInfo({
                layout: listItems[0].layoutPath,
                offset: listItems[0].offset
            })
        }
        else{
            setCustomInfo({
                layout: "",
                offset: ""
            })
        }
    }

    //Update custom layout path or offset
    const changeCustomSetting = (key, value) => {
        setCustomInfo(customInfo => {
            const updatedCustomInfo = {...customInfo}
            updatedCustomInfo[key] = value
            return updatedCustomInfo
        })
    }

    return (
            //Settings for output splits file
            <React.Fragment>
                <label title="The layout LiveSplit will use for your output splits">
                    Starting Layout: {useFirstInfo && (listItems.length!=0 && listItems[0].layoutPath.length!=0 ? (unmaskPaths ? listItems[0].layoutPath : "*".repeat(listItems[0].layoutPath.length)) : "N/A")}
                    {!useFirstInfo && <input type={unmaskPaths ? "text" : "password" } disabled={listItems.length < 2} placeholder={"layout"} value={customInfo.layout} onChange={(e) => changeCustomSetting("layout", e.target.value)}/>}
                </label><br/>
                <label title="The offset LiveSplit will use for your output splits">
                    Starting Offset: {useFirstInfo && (listItems.length!=0 ? listItems[0].offset : "N/A")}
                    {!useFirstInfo && <input type="text" disabled={listItems.length < 2} placeholder={"offset"} value={customInfo.offset} onChange={(e) => changeCustomSetting("offset", e.target.value)}/>}
                </label><br/>
                <label id="usefirst" title="Choose whether to use the first LiveSplit file's layout filepath and timer offset or custom specified ones">
                    Use Properties from First Entry: <input type="checkbox" htmlFor="unfirst" checked={useFirstInfo} onChange={(e) => toggleFirstInfo(e.target.checked)}/>
                </label><br/>
            </React.Fragment>
        )
    }