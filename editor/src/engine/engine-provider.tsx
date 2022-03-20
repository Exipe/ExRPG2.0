import Exrpg = require("exrpg");
import { AnchorPoint } from "exrpg/dist/util";
import React = require("react");
import { Graphics } from "./graphics";
import { LightSettings, useLightSettings } from "./light-settings";
import { HoverData, useTileHover } from "./tile-hover";

const RES_PATH = 'http://localhost:52501/res';

export type Dimensions = {
    width: number,
    height: number
}

export type IEngineContext = {
    engine?: Exrpg.Engine,
    loadMap: (content: string) => void,
    saveMap: () => string,
    resize: (width: number, height: number, 
        anchorX: AnchorPoint, anchorY: AnchorPoint) => void,
    getDimensions: () => Dimensions | undefined,
    hoverData: HoverData,
    lightSettings: LightSettings
};

const Context = React.createContext<IEngineContext>(undefined);

const prepare = async (canvas: HTMLCanvasElement): Promise<Exrpg.Engine> => {
    const engine = await Exrpg.initEngine(canvas, RES_PATH, true);

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

    const loadMap = (content: string) => {
        engine.map = Exrpg.loadScene(engine, content);
        engine.map.builder.autoUpdate = true;
    };

    const saveMap = () => {
        const scene = engine.map;
        return Exrpg.saveScene(scene);
    }

    const resize = (width: number, height: number, 
        anchorX: AnchorPoint, anchorY: AnchorPoint) => 
    {
        engine.map.resize(width, height, anchorX, anchorY)
    }

    const getDimensions = (): Dimensions => ({
        width: engine.map.width,
        height: engine.map.height
    })

    React.useEffect(() => {
        prepare(canvas.current).then((engine) => {
            setEngine(engine);
        });
    }, [canvas.current])

    const hoverData = useTileHover(engine);

    const context: IEngineContext = {
        engine,
        loadMap,
        saveMap,
        resize,
        getDimensions,
        lightSettings,
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
