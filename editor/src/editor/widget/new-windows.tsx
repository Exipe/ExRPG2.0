import React = require("react");
import { Button } from "../../component/button";
import { useEngine } from "../../engine/engine-provider";

export const NewWindow = () => {
    const { resetMap } = useEngine();

    return <div>
        <em>New map</em><br/>
        All unsaved edits will be lost<br/>
        <br/>
        <Button 
            onClick={() => { resetMap() }} 
            enabled={true}>
            Confirm
        </Button>
    </div>
};