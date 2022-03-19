import { AnchorPoint } from "exrpg/dist/util";
import React = require("react");
import { Button } from "../../component/button";
import { useEditor } from "../editor-provider";

type Anchor = {
    x: AnchorPoint,
    y: AnchorPoint
}

const anchorRange: AnchorPoint[] = [ 0, 1, 2 ]

const defaultAnchor: Anchor = {
    x: 0, y: 0
}

type Anchors = [ Anchor, React.ReactElement[] ];

const useAnchors = (): Anchors => {
    const [anchor, setAnchor] = React.useState<Anchor>(defaultAnchor);

    const anchors = React.useMemo<React.ReactElement[]>(() => {
        const anchorPoints: React.ReactElement[] = [];

        for(let iy of anchorRange) {
            for(let ix of anchorRange) {
                const select = anchor.x === ix && anchor.y === iy;

                anchorPoints.push(<div
                    key={iy*3+ix}
                    onClick={() => setAnchor({ x: ix, y: iy })}
                    className={select ? "selected" : ""} />)
            }
        }
        
        return anchorPoints;
    }, [anchor, setAnchor]);

    return [anchor, anchors];
}

export const DetailsWindow = () => {
    const { details } = useEditor();
    const { getDimensions, resize, name, setName } = details;
    const { width, height } = getDimensions();

    const [widthInput, setWidthInput] = React.useState(width.toString());
    const [heightInput, setHeightInput] = React.useState(height.toString());
    const [nameInput, setNameInput] = React.useState(name);

    const updateName = () => setName(nameInput);

    const numericWidth = parseInt(widthInput);
    const numericHeight = parseInt(heightInput);

    const validInput = numericWidth != NaN && numericWidth > 0
        && numericHeight != NaN && numericHeight > 0;
    
    const [anchor, anchorElements] = useAnchors();

    const onResize = () => {
        resize(numericWidth, numericHeight, anchor.x, anchor.y);
    }

    return <div id="detailsWindow">
        <div className="optionsGrid">
            <div>Map name:</div>
            <input 
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                size={12} 
                onBlur={updateName} />
        </div>

        <div id="mapSize">
            <em>Map size</em>

            <div className="optionsGrid">
                <div>Width:</div>
                <input
                    value={widthInput}
                    onChange={(e) => setWidthInput(e.target.value)}
                    size={3} />

                <div>Height:</div>
                <input
                    value={heightInput}
                    onChange={(e) => setHeightInput(e.target.value)}
                    size={3} />

                <div>Anchor:</div>
                <div id="anchorGrid">
                    {anchorElements}
                </div>
            </div>

            <Button 
                enabled={validInput} 
                onClick={onResize}
            >
                Resize
            </Button>
        </div>
    </div>
};