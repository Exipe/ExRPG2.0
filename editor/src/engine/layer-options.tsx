import { Engine, Layer, Scene } from "exrpg";
import React = require("react");

type LayerDefinition = {
    name: string
    getLayer: (scene: Scene) => Layer<any>
}

const layerDefinitions: LayerDefinition[] = [
    {
        name: "Base layer",
        getLayer: (scene) => scene.baseLayer
    },
    {
        name: "Wall layer",
        getLayer: (scene) => scene.wallLayer
    },
    {
        name: "Deco layer",
        getLayer: (scene) => scene.decoLayer
    },
    {
        name: "Overlay layer",
        getLayer: (scene) => scene.overlayLayer
    },
    {
        name: "Attrib layer",
        getLayer: (scene) => scene.attribLayer
    }
]

export type LayerData = {
    idx: number,
    visible: boolean,
    name: string
};

const initLayerData = (definition: LayerDefinition, idx: number): LayerData => ({
    idx,
    name: definition.name,
    visible: true
});

export type LayerOptions = {
    layers: LayerData[],
    setLayerVisibility: (idx: number, visible: boolean) => void
};

export const useLayerOptions = (engine: Engine): LayerOptions => {
    const [layers, setLayers] = React.useState(layerDefinitions.map((def, idx) =>
        initLayerData(def, idx)))

    const getLayer = React.useCallback((idx: number) => {
        return layerDefinitions[idx].getLayer(engine.map)
    }, [engine?.map])

    const setLayerVisibility = React.useCallback((idx: number, visible: boolean) => {
        setLayers(old => {
            return old.map((layer, i) => ({
                ...layer,
                visible: i == idx
                    ? visible
                    : layer.visible
            }))
        })
    }, [setLayers])

    React.useEffect(() => {
        if(!engine) {
            return
        }

        layers.forEach((layer, i) => {
            getLayer(i).visible = layer.visible
        })
    }, [engine, layers, getLayer])

    return {
        layers,
        setLayerVisibility
    }
}