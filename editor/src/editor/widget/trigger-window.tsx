import React = require("react");
import { Button } from "../../component/button";
import { useEditor } from "../editor-provider";

export const TriggerWindow = () => {
    const [editing, setEditing] = React.useState(false);

    const { trigger, setTrigger } = useEditor();
    const [actionInput, setActionInput] = React.useState(trigger.action);

    const update = () => {
        setEditing(false);
        setTrigger({ action: actionInput });
    };

    return <div className="warpOptions">
        <div className="optionsGrid">
            <div>Action:</div>
            <input 
                size={12} 
                disabled={!editing} 
                onChange={(e) => setActionInput(e.target.value)} 
                value={actionInput} />
        </div>

        {editing &&
            <Button 
                enabled={true} 
                onClick={update}
            >
                Save
            </Button>}

        {!editing &&
            <Button 
                enabled={true}
                onClick = {() => { setEditing(true) }}
            >
                Edit
            </Button>}
    </div>
};