import React = require("react");
import { useEngine } from "../../engine/engine-provider";

export const OptionsWindow = () => {
    const { layers, setLayerVisibility } = useEngine().layerOptions;

    return <div>
        <em>Render layers</em>
        <div className="optionsGrid">
            {layers.map(layer => 
            <React.Fragment key={layer.idx}>
                <div>{layer.name}</div>
                <input type="checkbox" 
                    checked={layer.visible}
                    onChange={(e) => setLayerVisibility(layer.idx, e.target.checked)} />
            </React.Fragment>)}
        </div>
    </div>
};