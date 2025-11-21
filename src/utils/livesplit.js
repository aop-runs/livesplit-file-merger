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