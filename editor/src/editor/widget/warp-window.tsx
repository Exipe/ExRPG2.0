import React = require("react");
import { Button } from "../../component/button";
import { useEditor } from "../editor-provider";

export const WarpWindow = () => {
    const [editing, setEditing] = React.useState(false);

    const { warp, setWarp } = useEditor();

    const [ mapInput, setMapInput ] = React.useState(warp.map);
    const [ xInput, setXInput ] = React.useState(warp.x.toString());
    const [ yInput, setYInput ] = React.useState(warp.y.toString());

    const update = () => {
        setEditing(false);
        setWarp({
            x: Number(xInput),
            y: Number(yInput),
            map: mapInput
        })
    }

    const validEdit = !isNaN(Number(xInput)) && !isNaN(Number(yInput));

    return <div className="warpOptions">
        <div className="optionsGrid">
            <div>Map ID:</div>
            <input 
                size={12}
                disabled={!editing}
                onChange={(e) => setMapInput(e.target.value)}
                value={mapInput} />

            <div>To X:</div>
            <input 
                size={12}
                disabled={!editing}
                onChange={(e) => setXInput(e.target.value)}
                value={xInput} />

            <div>To Y:</div>
            <input 
                size={12}
                disabled={!editing}
                onChange={(e) => setYInput(e.target.value)}
                value={yInput} />
        </div>

        {editing &&
            <Button
                enabled={validEdit}
                onClick={update}
            >
                Save
            </Button>}

        {!editing &&
            <Button
                enabled={true}
                onClick={() => setEditing(true)}
            >
                Edit
            </Button>}
    </div>
}