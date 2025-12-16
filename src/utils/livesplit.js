import { validSpecifier } from "./file";

//Constants
export const defaultSetup = "00:00:30.0000000"
export const defaultPBComp = "Game PBs"
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
    return `<?xml version="1.0" encoding="UTF-8"?>
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
</Run>`;
}

// Segment template
export function gatherSegmentTemplate(){
    return `<Segment>
<Name>
</Name>
<Icon />
<SplitTimes>
<SplitTime name="Personal Best" />
</SplitTimes>
<BestSegmentTime />
<SegmentHistory />
</Segment>`;
}

// Comparison template for carrying over Game PBs
function gatherPBsTemplate(compName){
    return `<SplitTime name="${compName}">
<RealTime></RealTime>
<GameTime></GameTime>
</SplitTime>`;
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

//Gather the names of all comparisons found
export function findCustomComparisons(contents){
    let splits = new DOMParser().parseFromString(contents, validSpecifier.streamType);
    let comparisons = [];
    for(let comp of splits.getElementsByTagName("SplitTimes")[0].getElementsByTagName("SplitTime")){
        if(comp.getAttribute("name") != "Personal Best"){
            comparisons.push(comp.getAttribute("name"))
        }
    }
    return comparisons;
}

//Gather full run name from splits
export function gatherRunName(game, category){
    let nameValues = [];
    for(let value of [game, category]){
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
        splits.getElementsByTagName("AttemptHistory")[0].removeChild(splits.getElementsByTagName("AttemptHistory")[0].getElementsByTagName("Attempt")[0]);
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
                splits.getElementsByTagName("Segment")[i].getElementsByTagName("Icon")[0].textContent = iconCache.indexOf(iconData) + 1;
            }
        }
        while(splits.getElementsByTagName("SegmentHistory")[i].getElementsByTagName("Time").length != 0){
            splits.getElementsByTagName("SegmentHistory")[i].removeChild(splits.getElementsByTagName("SegmentHistory")[i].getElementsByTagName("Time")[0]);
        }
    }
    return new XMLSerializer().serializeToString(splits);
}

//Create template split for setup splits and final subsplits with parameter support
function adjustTemplateText(template, game, category, currentNumber, totalGames){
    let parameters = templateParameters.map(
        (obj, index) => {
            return {param: obj.param, value: arguments[index + 1]}
        }
    )
    for(let pCheck of parameters){
        template = template.replace(pCheck.param, pCheck.value)
    }
    return template
}

//Convert split time to seconds
function timeToSeconds(time){
    let values = time.split(":");
    let hourValues = values[0].split(".");
    let hour = 0;
    if(hourValues.length == 2){
        hour = (hourValues[0] * 24) + hourValues[1];
    }
    else{
        hour = hourValues[0];
    }
    return (hour * 3600) + (parseInt(values[1]) * 60) + parseFloat(values[2]);
}

//Convert seconds to split time
function secondsToTime(time){
    let dayN = Math.floor(time / 86400);
    let hourN = Math.floor(time / 3600);
    let hour = "";
    if(dayN >= 1){
        hour = dayN.toString() + "." + (hourN % 24).toString();
    }
    else{
        hour = hourN < 10 ? "0" + hourN.toString() : hourN.toString();
    }
    let minN = Math.floor((time % 3600) / 60);
    let min = minN < 10 ? "0" + minN.toString() : minN.toString();
    let secN = Math.floor((time % 3600) % 60);
    let decimals = time - Math.floor(time);
    let sec = (secN < 10 ? "0" + secN.toString() : secN.toString()) + "." + decimals.toFixed(7).toString().split(".")[1];
    return [hour, min, sec].join(":");
}

//Create multi-game splits based on provided files and applied settings
export function createOutputSplits(files, outputSettings){
    
    //Everything outside segments
    let finalOutput = new DOMParser().parseFromString(gatherFullTemplate(), validSpecifier.streamType);
    finalOutput.getElementsByTagName("GameName")[0].textContent = outputSettings["runName"].game;
    finalOutput.getElementsByTagName("CategoryName")[0].textContent = outputSettings["runName"].category;
    let layout = outputSettings["customInfo"].layout == null ? files[0].layoutPath : outputSettings["customInfo"].layout
    let offset = outputSettings["customInfo"].offset == null ? files[0].offset : outputSettings["customInfo"].offset
    finalOutput.getElementsByTagName("LayoutPath")[0].textContent = layout;
    finalOutput.getElementsByTagName("Offset")[0].textContent = offset;

    //Create segments for combined splits
    let realTimeStamp = 0.0;
    let gameTimeStamp = 0.0;
    files.forEach((splitFile, fileIndex) => {
        let segmentContents = new DOMParser().parseFromString(splitFile.contents, validSpecifier.streamType).getElementsByTagName("Segments")[0];
        let runningReal = 0.0;
        let runningGame = 0.0;
        Array.from(segmentContents.children).forEach((child, childIndex) => {
            let newSegment = new DOMParser().parseFromString(gatherSegmentTemplate(), validSpecifier.streamType);
            
            //Match icon from cache if one exists
            newSegment.getElementsByTagName("Icon")[0].textContent = (outputSettings["toggles"].icon && child.getElementsByTagName("Icon")[0].textContent.length != 0) ? iconCache[parseInt(child.getElementsByTagName("Icon")[0].textContent) - 1] : "";

            //Carry over segment names and if needed, remove subsplit identifiers to accomodate subplits for each game
            if(outputSettings["toggles"].subs){
                let splitName = child.getElementsByTagName("Name")[0].textContent;
                if(childIndex == segmentContents.children.length - 1){
                    splitName = splitName.includes("}") ? splitName.slice(splitName.indexOf("}") + 1) : splitName;
                    splitName = "{" + adjustTemplateText(outputSettings["templateText"].final, splitFile.game, splitFile.category, fileIndex + 1, files.length) + "}" + splitName;
                }
                else{
                    splitName = splitName.startsWith("-") ? splitName.slice(1) : splitName;
                    splitName = "-" + splitName;
                }
                newSegment.getElementsByTagName("Name")[0].textContent = splitName;
            }
            else{
                newSegment.getElementsByTagName("Name")[0].textContent = child.getElementsByTagName("Name")[0].textContent;
            }

            //Carry over sum of bests for both real time and game time
            if(outputSettings["toggles"].sob){
                if(outputSettings["usedTimings"].realTime){
                    try{
                        newSegment.getElementsByTagName("BestSegmentTime")[0].appendChild(child.getElementsByTagName("BestSegmentTime")[0].getElementsByTagName("RealTime")[0]);
                    }
                    catch{}
                }
                if(outputSettings["usedTimings"].gameTime){
                    try{
                        newSegment.getElementsByTagName("BestSegmentTime")[0].appendChild(child.getElementsByTagName("BestSegmentTime")[0].getElementsByTagName("GameTime")[0]);
                    }
                    catch{}
                }
            }

            //Carry over pbs as a new comparison for both real time and game time
            if(outputSettings["toggles"].pb){
                let newSplitTime = new DOMParser().parseFromString(gatherPBsTemplate(outputSettings["gameComp"]), validSpecifier.streamType);
                newSegment.getElementsByTagName("SplitTimes")[0].appendChild(newSplitTime.documentElement)
                if(outputSettings["usedTimings"].realTime){
                    try{
                        let time = timeToSeconds(child.getElementsByTagName("SplitTimes")[0].getElementsByTagName("SplitTime")[0].getElementsByTagName("RealTime")[0].textContent);
                        runningReal += (time - runningReal) + realTimeStamp;
                        newSegment.getElementsByTagName("SplitTimes")[0].getElementsByTagName("SplitTime")[1].getElementsByTagName("RealTime")[0].textContent = secondsToTime(runningReal);
                    }
                    catch (error){
                        newSegment.getElementsByTagName("SplitTimes")[0].getElementsByTagName("SplitTime")[1].removeChild(newSegment.getElementsByTagName("SplitTimes")[0].getElementsByTagName("SplitTime")[1].getElementsByTagName("RealTime")[0]);
                    }
                }
                if(outputSettings["usedTimings"].gameTime){
                    try{
                        let time = timeToSeconds(child.getElementsByTagName("SplitTimes")[0].getElementsByTagName("SplitTime")[0].getElementsByTagName("GameTime")[0].textContent);
                        runningGame += (time - runningGame) + gameTimeStamp;
                        newSegment.getElementsByTagName("SplitTimes")[0].getElementsByTagName("SplitTime")[1].getElementsByTagName("GameTime")[0].textContent = secondsToTime(runningGame);
                    }
                    catch{
                        newSegment.getElementsByTagName("SplitTimes")[0].getElementsByTagName("SplitTime")[1].removeChild(newSegment.getElementsByTagName("SplitTimes")[0].getElementsByTagName("SplitTime")[1].getElementsByTagName("GameTime")[0]);
                    }
                }
            }
            finalOutput.getElementsByTagName("Segments")[0].appendChild(newSegment.documentElement);
        });
        //Create setup split if there are files remaining
        if(fileIndex != files.length - 1){
            let newSegment = new DOMParser().parseFromString(gatherSegmentTemplate(), validSpecifier.streamType);
            newSegment.getElementsByTagName("Name")[0].textContent = adjustTemplateText(outputSettings["templateText"].setup, files[fileIndex + 1].game, files[fileIndex + 1].category, fileIndex + 2, files.length);
            if(outputSettings["toggles"].sob){
                if(outputSettings["usedTimings"].realTime){
                    newSegment.getElementsByTagName("BestSegmentTime")[0].appendChild(new DOMParser().parseFromString(`<RealTime>${outputSettings["setupTime"]}</RealTime>`, validSpecifier.streamType).documentElement);
                }
                if(outputSettings["usedTimings"].gameTime){
                    newSegment.getElementsByTagName("BestSegmentTime")[0].appendChild(new DOMParser().parseFromString(`<GameTime>${outputSettings["setupTime"]}</GameTime>`, validSpecifier.streamType).documentElement);
                }
            }
            if(outputSettings["toggles"].pb){
                let newSplitTime = new DOMParser().parseFromString(gatherPBsTemplate(outputSettings["gameComp"]), validSpecifier.streamType);
                newSegment.getElementsByTagName("SplitTimes")[0].appendChild(newSplitTime.documentElement);
                if(outputSettings["usedTimings"].realTime){
                    runningReal += timeToSeconds(outputSettings["setupTime"]);
                    realTimeStamp = runningReal;
                    newSegment.getElementsByTagName("SplitTimes")[0].getElementsByTagName("SplitTime")[1].getElementsByTagName("RealTime")[0].textContent = secondsToTime(runningReal);
                }
                if(outputSettings["usedTimings"].gameTime){
                    runningGame += timeToSeconds(outputSettings["setupTime"]);
                    gameTimeStamp = runningGame;
                    newSegment.getElementsByTagName("SplitTimes")[0].getElementsByTagName("SplitTime")[1].getElementsByTagName("GameTime")[0].textContent = secondsToTime(runningGame);
                }
            }
            finalOutput.getElementsByTagName("Segments")[0].appendChild(newSegment.documentElement);
        }
    });
    return new XMLSerializer().serializeToString(finalOutput);
}