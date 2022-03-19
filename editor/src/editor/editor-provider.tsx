import { AnchorPoint } from "exrpg/dist/util";
import React = require("react");
import { Dimensions, useEngine } from "../engine/engine-provider";
import { TextureId, TileTextures } from "../model/tile-texture-model";
import { Action, ToolContext, ToolId, Tools } from "../model/tool-model";
import { TileTextureReducer } from "./tile-texture-reducer";
import { useToolModes } from "./tool-mode";

export type EditorEntity = {
    id: string,
    name: string,
    spritePath: string
}

export type WarpData = {
    x: number,
    y: number,
    map: string
}

export type TriggerData = {
    action: string
};

const defaultWarp: WarpData = {
    x: 0,
    y: 0,
    map: ""
};

const defaultTrigger: TriggerData = {
    action: ""
}

export type Details = {
    getDimensions: () => Dimensions,
    resize: (width: number, height: number, 
        anchorX: AnchorPoint, anchorY: AnchorPoint) => void;
    name: string,
    setName: (name: string) => void
}

export type IEditorContext = {
    tileTextures: TileTextures,
    selectTexture: (id: TextureId, x: number, y: number) => void,
    tool?: ToolId,
    setTool: (tool?: ToolId) => void,
    selectToolMode: (tool: ToolId, mode: string) => void,
    toolMode?: string,
    object?: EditorEntity,
    setObject: (object: EditorEntity) => void,
    npc?: EditorEntity,
    setNpc: (npc: EditorEntity) => void,
    item?: EditorEntity,
    setItem: (item: EditorEntity) => void,
    warp: WarpData,
    setWarp: (warp: WarpData) => void,
    trigger: TriggerData,
    setTrigger: (trigger: TriggerData) => void,
    details?: Details
};

const Context = React.createContext<IEditorContext>({
    tileTextures: {},
    selectTexture: () => {},
    setTool: () => {},
    selectToolMode: () => {},
    setObject: () => {},
    setNpc: () => {},
    setItem: () => {},
    warp: defaultWarp,
    setWarp: () => {},
    trigger: defaultTrigger,
    setTrigger: () => {},
});

type AppliedAction = {
    action: Action,
    cleanUp: Action,
}

export const EditorProvider: React.FC<{}> = ({
    children
}) => {
    const [tileTextures, tileTextureDispatch] = React.useReducer(
        TileTextureReducer, {});

    const [ appliedActions, setAppliedActions ] = React.useState<AppliedAction[]>([]);
    const [ undoneActions, setUndoneActions ] = React.useState<Action[]>([]);

    const [ toolId, setToolId ] = React.useState<ToolId | undefined>();
    const [ toolModes, selectToolMode ] = useToolModes();

    const [ object, setObject ] = React.useState<EditorEntity | undefined>();
    const [ npc, setNpc ] = React.useState<EditorEntity | undefined>();
    const [ item, setItem ] = React.useState<EditorEntity | undefined>();
    const [ warp, setWarp ] = React.useState<WarpData>(defaultWarp);
    const [ trigger, setTrigger ] = React.useState<TriggerData>(defaultTrigger);

    const [ name, setName ] = React.useState<string>("");

    const { engine, getDimensions, resize } = useEngine();

    const toolMode = React.useMemo(
        () => toolModes[toolId], 
        [toolModes, toolId]);

    const toolContext = React.useMemo<ToolContext>(() => ({
        tileTextures,
        object, npc, item,
        warp, trigger
    }), [tileTextures, object, npc, item, warp, trigger])

    const applyTool = React.useCallback((x: number, y: number) => {
        if(toolId === undefined) {
            return;
        }

        const tool = Tools[toolId];
        const action = tool.createAction(toolMode, x, y, toolContext);
        const cleanUp = action(engine.map.builder);
        if(!(cleanUp instanceof Object)) {
            throw "Tool did not return a clean-up function";
        }

        setAppliedActions([...appliedActions, { action, cleanUp }]);
    }, [toolId, toolMode, toolContext, setAppliedActions]);

    const undo = () => {
        const { action, cleanUp } = appliedActions.at(-1);
        cleanUp(engine.map.builder);

        setAppliedActions(appliedActions.slice(0, -1));
        setUndoneActions([...undoneActions, action]);
    };

    const redo = () => {
        const action = undoneActions.at(-1);
        const cleanUp = action(engine.map.builder);
        if(!(cleanUp instanceof Object)) {
            throw "Tool did not return a clean-up function";
        }

        setAppliedActions([...appliedActions, { action, cleanUp }]);
    };

    const selectTexture = (id: TextureId, x: number, y: number) => {
        tileTextureDispatch({
            type: "SELECT_TEXTURE",
            id, x, y
        });
    }

    React.useEffect(() => {
        if(engine === undefined) {
            return;
        }

        engine.inputHandler.onTileClick = (x, y, altKey) => {
            if(altKey) {
                return;
            }

            applyTool(x, y);
        }

        return () => {
            engine.inputHandler.onTileClick = () => {};
        }
    }, [engine, applyTool])

    React.useEffect(() => {
        if(engine === undefined) {
            return;
        }

        const loadTexture = (id: TextureId, path: string) => {
            const src = engine.resPath + "/tile/" + path;
            const img = new Image();
            img.onload = () => {
                tileTextureDispatch({
                    type: "SET_TEXTURE", id,
                    texture: {
                        src,
                        width: img.width,
                        height: img.height,
                    }
                })
            }
            img.src = src;
        }

        loadTexture("groundTexture", "ground.png");
        loadTexture("shapeTexture", "shape.png");
        loadTexture("wallTexture", "wall.png");
        loadTexture("decoTexture", "deco.png");
    }, [engine])

    const details: Details = {
        getDimensions,
        resize,
        name, setName
    };
    
    const context: IEditorContext = {
        tileTextures, selectTexture,
        tool: toolId, setTool: setToolId,
        selectToolMode, toolMode,
        object, setObject,
        npc, setNpc,
        item, setItem,
        warp, setWarp,
        trigger, setTrigger,
        details
    };

    return <Context.Provider 
        value={context}
    >
        {children}
    </Context.Provider>
}

export const useEditor = () => React.useContext(Context);
