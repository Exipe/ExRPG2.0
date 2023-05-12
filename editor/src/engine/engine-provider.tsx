import Exrpg = require("exrpg");
import { AnchorPoint } from "exrpg/dist/util";
import React = require("react");
import { Graphics } from "./graphics";
import { LightSettings, useLightSettings } from "./light-settings";
import { HoverData, useTileHover } from "./tile-hover";
import { LayerOptions, useLayerOptions } from "./layer-options";

declare var __RES_PATH__: string;

export type Dimensions = {
    width: number,
    height: number
}

export type IEngineContext = {
    engine?: Exrpg.Engine,
    resetMap: () => void,
    loadMap: (content: string) => void,
    saveMap: () => string,
    rebuildIslandMap: () => void,
    resize: (width: number, height: number, 
        anchorX: AnchorPoint, anchorY: AnchorPoint) => void,
    getDimensions: () => Dimensions | undefined,
    hoverData: HoverData,
    lightSettings: LightSettings,
    layerOptions: LayerOptions
};

const Context = React.createContext<IEngineContext>(undefined);

const prepare = async (canvas: HTMLCanvasElement): Promise<Exrpg.Engine> => {
    const engine = await Exrpg.initEngine(canvas, __RES_PATH__, true);

    engine.map = new Exrpg.Scene(engine, 10, 10);
    engine.map.builder.autoUpdate = true;

    const resize = () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        engine.resize(canvas.width, canvas.height);
    };

    window.onresize = resize;
    resize();

    const onDrag = (dx: number, dy: number, altKey: boolean) => {
        if(!altKey) {
            return;
        }

        const camera = engine.camera;
        camera.move(camera.x - dx, camera.y - dy);
    };
    engine.inputHandler.onMouseDrag = onDrag;
    engine.inputHandler.clickOnDrag = true;

    engine.camera.scale = 2;

    return engine;
};

export const EngineProvider: React.FC<{}> = ({
    children
}) => {
    const canvas = React.useRef<HTMLCanvasElement>();
    const [engine, setEngine] = React.useState<Exrpg.Engine | undefined>();

    const lightSettings = useLightSettings(engine);
    const layerOptions = useLayerOptions(engine);

    const setMap = React.useCallback((map: Exrpg.Scene) => {
        if(engine.map != null) {
            engine.map.destroy();
        }

        engine.map = map;
        engine.map.builder.autoUpdate = true;
    }, [engine]);

    const rebuildIslandMap = React.useCallback(() => {
        engine.map.islandMap.rebuild();
    }, [engine]);

    const resetMap = React.useCallback(() => {
        setMap(
            new Exrpg.Scene(engine, 10, 10));
    }, [setMap]);

    const loadMap = React.useCallback((content: string) => {
        setMap(
            Exrpg.loadScene(engine, content));
    }, [setMap]);

    const saveMap = React.useCallback(() => {
        const scene = engine.map;
        return Exrpg.saveScene(scene);
    }, [engine]);

    const resize = React.useCallback((width: number, height: number, 
        anchorX: AnchorPoint, anchorY: AnchorPoint) => 
    {
        engine.map.resize(width, height, anchorX, anchorY)
    }, [engine]);

    const getDimensions = React.useCallback((): Dimensions => ({
        width: engine.map.width,
        height: engine.map.height
    }), [engine]);

    React.useEffect(() => {
        prepare(canvas.current).then((engine) => {
            setEngine(engine);
        });
    }, [canvas.current])

    const hoverData = useTileHover(engine);

    const context: IEngineContext = {
        engine,
        rebuildIslandMap,
        resetMap,
        loadMap,
        saveMap,
        resize,
        getDimensions,
        lightSettings,
        layerOptions,
        hoverData
    }

    return <>
        <canvas ref={canvas} />

        <Context.Provider value={context}>
            {engine !== undefined && <Graphics />}
            {children}
        </Context.Provider>
    </>
}

export const useEngine = () => React.useContext(Context);
