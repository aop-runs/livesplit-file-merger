import { validSpecifier } from "./file";

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
    `
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
    `
}

//Gather data from specific tag
export function gatherSplitsDataByTag(contents, tag){
    let splits = new DOMParser().parseFromString(contents, validSpecifier.streamType);
    return splits.getElementsByTagName(tag)[0].textContent.trim()
}

//Gather full run name from splits
export function gatherRunName(contents){
    let nameValues = []
    for(let tag of ["GameName", "CategoryName"]){
        let value = gatherSplitsDataByTag(contents, tag)
        if(value){
            nameValues.push(value)
        }
    }
    if(nameValues.length == 0){
        return "Untitled"
    }
    return nameValues.join(" - ")
}

//Remove icon data from splits file for quicker DOM parsing
export function removeIconData(contents){
    let splits = new DOMParser().parseFromString(contents, validSpecifier.streamType);
    splits.getElementsByTagName("GameIcon")[0].textContent = ""
    for(let i = 0; i < splits.getElementsByTagName("Segment").length; i++){
        splits.getElementsByTagName("Segment")[i].getElementsByTagName("Icon")[0].textContent = ""
    }
    return new XMLSerializer().serializeToString(splits)
}