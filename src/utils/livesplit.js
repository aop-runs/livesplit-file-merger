import { validSpecifier } from "./file";

//Constants
export const defaultSetup = "00:00:30.0000000"
export const defaultPBComp = "Game PBs"
export const templateParameters = [
    {param: "%NG%", name: "Game Name"},
    {param: "%NGP%", name: "Game Name (Previous)"},
    {param: "%NGN%", name: "Game Name (Next)"},
    {param: "%NC%", name: "Category Name"},
    {param: "%NCP%", name: "Category Name (Previous)"},
    {param: "%NCN%", name: "Category Name (Next)"},
    {param: "%GN%", name: "Current Game Number"},
    {param: "%GC%", name: "Current Games Completed"},
    {param: "%TC%", name: "Total Game Count"}
]

//Cache list
export let iconCache = [];

// Splits template
export function gatherFullTemplate(emuUsage){
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
    <Platform usesEmulator="${emuUsage ? "True" : "False"}">
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

// Comparison template for carrying over Game PBs and other useable comparisons
function gatherComparisonTemplate(compName){
    return `<SplitTime name="${compName}">
<RealTime></RealTime>
<GameTime></GameTime>
</SplitTime>`;
}
// Comparison template for carrying over Game PBs and other useable comparisons
function gatherVariableTemplate(name){
    return `<Variable name="${name}">
</Variable>`;
}

// Segment template
export function gatherSegmentTemplate(){
    return `<Segment>
<Name>
</Name>
<Icon />
<SplitTimes>
${gatherComparisonTemplate("Personal Best")}
</SplitTimes>
<BestSegmentTime>
<RealTime></RealTime>
<GameTime></GameTime>
</BestSegmentTime>
<SegmentHistory />
</Segment>`;
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
    let iconData = splits.getElementsByTagName("GameIcon")[0].textContent.trim();
    if(iconData.length != 0){
        if(!iconCache.includes(iconData)){
            iconCache.push(iconData);
            splits.getElementsByTagName("GameIcon")[0].textContent = iconCache.length;
        }
        else{
            splits.getElementsByTagName("GameIcon")[0].textContent = iconCache.indexOf(iconData) + 1;
        }
    }
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
function adjustTemplateText(template, game, gameP, gameN, category, categoryP, categoryN, currentNumber, gamesCompleted, totalGames){
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
export function timeToSeconds(time){
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
    let finalOutput = new DOMParser().parseFromString(gatherFullTemplate(outputSettings["runMetadata"].emu), validSpecifier.streamType);
    finalOutput.getElementsByTagName("GameName")[0].textContent = outputSettings["runName"].game;
    finalOutput.getElementsByTagName("CategoryName")[0].textContent = outputSettings["runName"].category;
    let layout = outputSettings["customInfo"].layout == null ? files[0].layoutPath : outputSettings["customInfo"].layout;
    let offset = outputSettings["customInfo"].offset == null ? files[0].offset : outputSettings["customInfo"].offset;
    finalOutput.getElementsByTagName("LayoutPath")[0].textContent = layout;
    finalOutput.getElementsByTagName("Offset")[0].textContent = offset;
    finalOutput.getElementsByTagName("Metadata")[0].getElementsByTagName("Region")[0].textContent = outputSettings.runMetadata.region;
    finalOutput.getElementsByTagName("Metadata")[0].getElementsByTagName("Platform")[0].textContent = outputSettings.runMetadata.platform;
    for(let variable of outputSettings["runMetadata"].variables){
        let newVar = new DOMParser().parseFromString(gatherVariableTemplate(variable.name), validSpecifier.streamType);
        newVar.getElementsByTagName("Variable")[0].textContent = variable.choice;
        finalOutput.getElementsByTagName("Variables")[0].appendChild(newVar.documentElement);
    }

    //Determine what comparisons will be used depending on whether game PBs and other comparisons present in each file are toggled
    let comparisons = outputSettings["toggleSettings"].comp ? outputSettings["usedComparisons"].filter(comp => comp.used).map(comp => comp.name) : [];
    comparisons = outputSettings["toggleSettings"].pb ? [outputSettings["gameComp"], ...comparisons] : comparisons;
    let splitTimes = comparisons.map(
        (name) => {
            return {
                name: name,
                real: {tag: "RealTime", check: outputSettings["usedTimings"].realTime, runningSeconds: 0.0, setupTimestamp: 0.0},
                game: {tag: "GameTime", check: outputSettings["usedTimings"].gameTime, runningSeconds: 0.0, setupTimestamp: 0.0}
            }
        }
    );

    //Create segments for combined splits
    files.forEach((splitFile, fileIndex) => {
        let segmentContents = new DOMParser().parseFromString(splitFile.contents, validSpecifier.streamType);
        let runningRealGold = 0.0;
        let runningGameGold = 0.0;
        Array.from(segmentContents.getElementsByTagName("Segments")[0].children).forEach((child, childIndex) => {
            let newSegment = new DOMParser().parseFromString(gatherSegmentTemplate(), validSpecifier.streamType);
             
            //If creating full game splits
            if(outputSettings["toggleSettings"].full){
                
                //Match icon from cache if one exists
                newSegment.getElementsByTagName("Icon")[0].textContent = (outputSettings["toggleSettings"].icon && child.getElementsByTagName("Icon")[0].textContent.length != 0) ? iconCache[parseInt(child.getElementsByTagName("Icon")[0].textContent) - 1] : "";

                //Carry over segment names and if needed, remove subsplit identifiers to accomodate subplits for each game
                if(outputSettings["toggleSettings"].subs && segmentContents.getElementsByTagName("Segments")[0].children.length > 1){
                    let splitName = child.getElementsByTagName("Name")[0].textContent;
                    if(childIndex == segmentContents.getElementsByTagName("Segments")[0].children.length - 1){
                        splitName = splitName.includes("}") ? splitName.slice(splitName.indexOf("}") + 1) : splitName;
                        splitName = "{" +
                        adjustTemplateText(outputSettings["templateText"].final, splitFile.game, (fileIndex > 0 ? files[fileIndex - 1].game : ""), (fileIndex < files.length-1 ? files[fileIndex + 1].game : ""), splitFile.category, (fileIndex > 0 ? files[fileIndex - 1].category : ""), (fileIndex < files.length-1 ? files[fileIndex + 1].category : ""), fileIndex + 1, fileIndex, files.length)
                        + "}" + splitName;
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

                //Carry over all relevant comparisons for both real time and game time
                for(let comp of splitTimes){
                    let newSplitTime = new DOMParser().parseFromString(gatherComparisonTemplate(comp.name), validSpecifier.streamType);
                    newSegment.getElementsByTagName("SplitTimes")[0].appendChild(newSplitTime.documentElement);
                    for(let timing of ["real", "game"]){
                        if(comp[timing].check){
                            try{
                                let time = timeToSeconds(child.getElementsByTagName("SplitTimes")[0].getElementsByTagName("SplitTime")[0].getElementsByTagName(comp[timing].tag)[0].textContent);
                                comp[timing].runningSeconds += (time - comp[timing].runningSeconds) + comp[timing].setupTimestamp;
                                newSegment.getElementsByTagName("SplitTimes")[0].getElementsByTagName("SplitTime")[1].getElementsByTagName(comp[timing].tag)[0].textContent = secondsToTime(comp[timing].runningSeconds);
                            }
                            catch{}
                        }
                    }
                }
            }

            //Carry over sum of bests for both real time and game time
            if(outputSettings["toggleSettings"].sob){
                for(let timing of [ ["RealTime", outputSettings["usedTimings"].realTime], ["GameTime", outputSettings["usedTimings"].gameTime] ]){
                    if(timing[1]){
                        try{
                            if(outputSettings["toggleSettings"].full){
                                newSegment.getElementsByTagName("BestSegmentTime")[0].getElementsByTagName(timing[0])[0].textContent = child.getElementsByTagName("BestSegmentTime")[0].getElementsByTagName(timing[0])[0].textContent;
                            }
                            else{
                                if(timing[0] == "RealTime" && runningRealGold != null){
                                    runningRealGold += timeToSeconds(child.getElementsByTagName("BestSegmentTime")[0].getElementsByTagName(timing[0])[0].textContent);
                                }
                                else if(timing[0] == "GameTime" && runningGameGold != null){
                                    runningGameGold += timeToSeconds(child.getElementsByTagName("BestSegmentTime")[0].getElementsByTagName(timing[0])[0].textContent);
                                }
                            }
                        }
                        catch{
                            if(!outputSettings["toggleSettings"].full){
                                if(timing[0] == "RealTime"){
                                    runningRealGold = null;
                                }
                                else{
                                    runningGameGold = null;
                                }
                            }
                        }
                    }
                }
            }
            if(outputSettings["toggleSettings"].full){
                finalOutput.getElementsByTagName("Segments")[0].appendChild(newSegment.documentElement);
            }

            //Only create split when every split has been parsed if using one split for each game
            else if(!outputSettings["toggleSettings"].full && childIndex == segmentContents.getElementsByTagName("Segments")[0].children.length - 1){
                
                //Match icon from cache if one exists and name split after game split template
                newSegment.getElementsByTagName("Icon")[0].textContent = (outputSettings["toggleSettings"].icon && segmentContents.getElementsByTagName("GameIcon")[0].textContent.length != 0) ? iconCache[parseInt(segmentContents.getElementsByTagName("GameIcon")[0].textContent) - 1] : "";
                newSegment.getElementsByTagName("Name")[0].textContent =
                adjustTemplateText(outputSettings["templateText"].final, splitFile.game, (fileIndex > 0 ? files[fileIndex - 1].game : ""), (fileIndex < files.length-1 ? files[fileIndex + 1].game : ""), splitFile.category, (fileIndex > 0 ? files[fileIndex - 1].category : ""), (fileIndex < files.length-1 ? files[fileIndex + 1].category : ""), fileIndex + 1, fileIndex, files.length);

                //Set split's gold to game's sum of best segments
                for(let timing of [ ["RealTime", runningRealGold != null && runningRealGold != 0.0, runningRealGold], ["GameTime", runningGameGold != null && runningGameGold != 0.0 , runningGameGold] ]){
                    if(timing[1]){
                        newSegment.getElementsByTagName("BestSegmentTime")[0].getElementsByTagName(timing[0])[0].textContent = secondsToTime(timing[2])
                    }
                }

                //Carry over all relevant comparisons for both real time and game time
                for(let comp of splitTimes){
                    let newSplitTime = new DOMParser().parseFromString(gatherComparisonTemplate(comp.name), validSpecifier.streamType);
                    newSegment.getElementsByTagName("SplitTimes")[0].appendChild(newSplitTime.documentElement);
                    for(let timing of ["real", "game"]){
                        if(comp[timing].check){
                            try{
                                let time = timeToSeconds(child.getElementsByTagName("SplitTimes")[0].getElementsByTagName("SplitTime")[0].getElementsByTagName(comp[timing].tag)[0].textContent);
                                comp[timing].runningSeconds += (time - comp[timing].runningSeconds) + comp[timing].setupTimestamp;
                                newSegment.getElementsByTagName("SplitTimes")[0].getElementsByTagName("SplitTime")[1].getElementsByTagName(comp[timing].tag)[0].textContent = secondsToTime(comp[timing].runningSeconds);
                            }
                            catch{}
                        }
                    }
                }
                finalOutput.getElementsByTagName("Segments")[0].appendChild(newSegment.documentElement);
            }

        });
        runningRealGold = 0.0;
        runningGameGold = 0.0;
        
        //Create setup split if there are files remaining
        if(fileIndex != files.length - 1 && files[fileIndex + 1].setup != "" && timeToSeconds(files[fileIndex + 1].setup) != 0){
            let newSegment = new DOMParser().parseFromString(gatherSegmentTemplate(), validSpecifier.streamType);
            newSegment.getElementsByTagName("Name")[0].textContent =
            adjustTemplateText(outputSettings["templateText"].setup, files[fileIndex + 1].game, files[fileIndex].game, (fileIndex < files.length-2 ? files[fileIndex + 2].game : ""), files[fileIndex + 1].category, files[fileIndex].category, (fileIndex < files.length-2 ? files[fileIndex + 2].category : ""), fileIndex + 2, fileIndex + 1, files.length)

            //Assign setup time as a default gold for setup split
            if(outputSettings["toggleSettings"].sob){
                for(let timing of [ ["RealTime", outputSettings["usedTimings"].realTime], ["GameTime", outputSettings["usedTimings"].gameTime] ]){
                    if(timing[1]){
                        try{
                            newSegment.getElementsByTagName("BestSegmentTime")[0].getElementsByTagName(timing[0])[0].textContent = files[fileIndex + 1].setup;
                        }
                        catch{}
                    }
                }
            }

            //Add all relevant comparisons for setup split
            for(let comp of splitTimes){
                let newSplitTime = new DOMParser().parseFromString(gatherComparisonTemplate(comp.name), validSpecifier.streamType);
                newSegment.getElementsByTagName("SplitTimes")[0].appendChild(newSplitTime.documentElement);
                for(let timing of ["real", "game"]){
                    if(comp[timing].check){
                        let compIndex = newSegment.getElementsByTagName("SplitTimes")[0].getElementsByTagName("SplitTime").length - 1;
                        comp[timing].runningSeconds += timeToSeconds(files[fileIndex + 1].setup);
                        newSegment.getElementsByTagName("SplitTimes")[0].getElementsByTagName("SplitTime")[compIndex].getElementsByTagName(comp[timing].tag)[0].textContent = secondsToTime(comp[timing].runningSeconds);
                        comp[timing].setupTimestamp = comp[timing].runningSeconds;
                        comp[timing].runningSeconds = 0.0;
                    }
                }
            }
            finalOutput.getElementsByTagName("Segments")[0].appendChild(newSegment.documentElement);
        }
    });
    return new XMLSerializer().serializeToString(finalOutput);
}