import { validSpecifier } from "./file";

//Constants
export const defaultSetup = "00:00:30.0000000"
export const templateParameters = [
    {param: "%NG%", name: "Game Name"},
    {param: "%NC%", name: "Category Name"},
    {param: "%GC%", name: "Total Game Count"},
    {param: "%GN%", name: "Current Game Number"}
]

//Cache list
export let iconCache = [];

// Splits template
export function gatherFullTemplate(){
    return `
        <?xml version="1.0" encoding="UTF-8"?>
        <Run version="1.7.0">
        <GameIcon />
        <GameName>
        </GameName>
        <CategoryName>
        </CategoryName>
        <LayoutPath>
        </LayoutPath>
        <Metadata>
            <Run id="" />
            <Platform usesEmulator="False">
            </Platform>
            <Region>
            </Region>
            <Variables />
            <CustomVariables />
        </Metadata>
        <Offset>00:00:00</Offset>
        <AttemptCount>0</AttemptCount>
        <AttemptHistory />
        <Segments>
        </Segments>
        <AutoSplitterSettings />
        </Run>
    `;
}

// Segment template
export function gatherSegmentTemplate(){
    return `
        <Segment>
        <Name>
        </Name>
        <Icon />
        <SplitTimes>
        <SplitTime name="Personal Best" />
        </SplitTimes>
        <BestSegmentTime />
        <SegmentHistory />
        </Segment>
    `;
}

//Gather data from specific tag
export function gatherSplitsDataByTag(contents, tag){
    let splits = new DOMParser().parseFromString(contents, validSpecifier.streamType);
    return splits.getElementsByTagName(tag)[0].textContent.trim();
}

//Replace splits data from specific tag
export function replaceSplitsDataByTag(contents, tag, newValue){
    let splits = new DOMParser().parseFromString(contents, validSpecifier.streamType);
    splits.getElementsByTagName(tag)[0].textContent = newValue;
    return new XMLSerializer().serializeToString(splits);
}

//Gather full run name from splits
export function gatherRunName(contents){
    let nameValues = [];
    for(let tag of ["GameName", "CategoryName"]){
        let value = gatherSplitsDataByTag(contents, tag);
        if(value){
            nameValues.push(value);
        }
    }
    if(nameValues.length == 0){
        return "Untitled";
    }
    return nameValues.join(" - ");
}

//Clean splits file to remove irrelevant data for quicker DOM parsing and add reusable segment icons to cache
export function cleanSplitsFile(contents){
    let splits = new DOMParser().parseFromString(contents, validSpecifier.streamType);

    //Game Icon and Attempt History
    splits.getElementsByTagName("GameIcon")[0].textContent = "";
    while(splits.getElementsByTagName("AttemptHistory")[0].getElementsByTagName("Attempt").length != 0){
        splits.getElementsByTagName("AttemptHistory")[0].removeChild(splits.getElementsByTagName("AttemptHistory")[0].getElementsByTagName("Attempt")[0])
    }

    //Segment Icons and History
    for(let i = 0; i < splits.getElementsByTagName("Segment").length; i++){
        let iconData = splits.getElementsByTagName("Segment")[i].getElementsByTagName("Icon")[0].textContent.trim();
        if(iconData.length != 0){
            if(!iconCache.includes(iconData)){
                iconCache.push(iconData);
                splits.getElementsByTagName("Segment")[i].getElementsByTagName("Icon")[0].textContent = iconCache.length;
            }
            else{
                splits.getElementsByTagName("Segment")[i].getElementsByTagName("Icon")[0].textContent = iconCache.indexOf(iconData) + 1
            }
        }
        while(splits.getElementsByTagName("SegmentHistory")[i].getElementsByTagName("Time").length != 0){
            splits.getElementsByTagName("SegmentHistory")[i].removeChild(splits.getElementsByTagName("SegmentHistory")[i].getElementsByTagName("Time")[0])
        }
    }
    return new XMLSerializer().serializeToString(splits);
}