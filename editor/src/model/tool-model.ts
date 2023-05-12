import { SceneBuilder } from "exrpg";
import { EditorEntity, TriggerData, WarpData } from "../editor/editor-provider";
import { TileTextures } from "./tile-texture-model";

export type ToolContext = {
    tileTextures: TileTextures,
    object: EditorEntity,
    npc: EditorEntity,
    item: EditorEntity,
    warp: WarpData,
    trigger: TriggerData
};

export type Action = (sceneBuilder: SceneBuilder) => Action | void;

export type Tool = {
    name: string;
    modes: string[];
    createAction: (mode: string, x: number, y: number,
        context: ToolContext) => Action;
};

export const GroundTool: Tool = {
    name: "Ground",
    modes: ["Draw", "Erase", "Fill"],

    createAction: (mode, x, y, context) => (builder) => {
        const { selectX, selectY } = context.tileTextures.groundTexture;

        switch(mode) {
            case "Draw":
                builder.putGround(x, y, selectX, selectY);
                break;
            case "Erase":
                builder.removeBase(x, y);
                break;
            case "Fill":
                builder.fillGround(x, y, selectX, selectY);
                break;
        }
    },
};

export const WaterTool: Tool = {
    name: "Water",
    modes: ["Draw", "Erase", "Fill"],

    createAction: (mode, x, y, _context) => (builder) => {
        switch(mode) {
            case "Draw":
                builder.putWater(x, y);
                break;
            case "Erase":
                builder.removeBase(x, y);
                break;
            case "Fill":
                builder.fillWater(x, y);
                break;
        }
    },
};

export const ShapeTool: Tool = {
    name: "Shape",
    modes: ["Draw", "Erase"],

    createAction: (mode, x, y, context) => (builder) => {
        const { selectX: groundX, selectY: groundY } = context.tileTextures.groundTexture;
        const { selectX: shapeX, selectY: shapeY } = context.tileTextures.shapeTexture;

        switch(mode) {
            case "Draw":
                builder.putOverlay(x, y, groundX, groundY, shapeX, shapeY);
                break;
            case "Erase":
                builder.removeOverlay(x, y);
                break;
        }
    },
};

export const WallTool: Tool = {
    name: "Wall",
    modes: ["Draw", "Erase", "Fill"],

    createAction: (mode, x, y, context) => (builder) => {
        const { selectX, selectY } = context.tileTextures.wallTexture;

        switch(mode) {
            case "Draw":
                builder.putWall(x, y, selectX, selectY);
                break;
            case "Erase":
                builder.removeWall(x, y);
                break;
            case "Fill":
                builder.fillWall(x, y, selectX, selectY);
                break;
        }
    },
};

export const DecorationTool: Tool = {
    name: "Decoration",
    modes: ["Draw", "Erase"],

    createAction: (mode, x, y, context) => (builder) => {
        const { selectX, selectY } = context.tileTextures.decoTexture;

        switch(mode) {
            case "Draw":
                builder.putDeco(x, y, selectX, selectY);
                break;
            case "Erase":
                builder.removeDeco(x, y);
                break;
        }
    },
};

export const ObjectTool: Tool = {
    name: "Object",
    modes: ["Place", "Remove"],

    createAction: (mode, x, y, context) => (builder) => {
        const entity = context.object;

        switch(mode) {
            case "Place":
                if(!entity) {
                    return;
                }

                builder.putObject(x, y, entity.id);
                break;
            case "Remove":
                builder.removeAttrib(x, y);
                break;
        }
    }
}

export const NpcTool: Tool = {
    name: "NPC",
    modes: ["Place", "Remove"],

    createAction: (mode, x, y, context) => (builder) => {
        const entity = context.npc;

        switch(mode) {
            case "Place":
                if(!entity) {
                    return;
                }

                builder.putNpc(x, y, entity.id);
                break;
            case "Remove":
                builder.removeAttrib(x, y);
                break;
        }
    }
}

export const ItemTool: Tool = {
    name: "Item",
    modes: ["Place", "Remove"],

    createAction: (mode, x, y, context) => (builder) => {
        const entity = context.item;

        switch(mode) {
            case "Place":
                if(!entity) {
                    return;
                }

                builder.putItem(x, y, entity.id);
                break;
            case "Remove":
                builder.removeAttrib(x, y);
                break;
        }
    }
}

export const BlockTool: Tool = {
    name: "Block",
    modes: ["On", "Off"],

    createAction: (mode, x, y) => (builder) => {
        switch(mode) {
            case "On":
                builder.putBlock(x, y);
                break;
            case "Off":
                builder.removeAttrib(x, y);
                break;
        }
    }
};

export const NpcAvoidTool: Tool = {
    name: "NPC-avoid",
    modes: ["On", "Off"],

    createAction: (mode, x, y) => (builder) => {
        switch(mode) {
            case "On":
                builder.putNpcAvoid(x, y);
                break;
            case "Off":
                builder.removeAttrib(x, y);
                break;
        }
    }
};

export const IslandTool: Tool = {
    name: "Island",
    modes: ["Place", "Remove"],

    createAction: (mode, x, y) => (builder) => {
        switch(mode) {
            case "Place":
                builder.putIsland(x, y);
                break;
            case "Remove":
                builder.removeAttrib(x, y);
                break;
        }
    }
};

export const WarpTool: Tool = {
    name: "Warp",
    modes: ["Place", "Remove"],

    createAction: (mode, x, y, context) => (builder) => {
        const warp = context.warp;
        console.log("warp", warp);

        switch(mode) {
            case "Place":
                builder.putWarp(x, y, warp.map, warp.x, warp.y);
                break;
            case "Remove":
                builder.removeAttrib(x, y);
                break;
        }
    }
};

export const TriggerTool: Tool = {
    name: "Trigger",
    modes: ["Place", "Remove"],

    createAction: (mode, x, y, context) => (builder) => {
        const trigger = context.trigger;
        console.log("trigger", trigger);

        switch(mode) {
            case "Place":
                builder.putTrigger(x, y, trigger.action);
                break;
            case "Remove":
                builder.removeAttrib(x, y);
                break;
        }
    }
};

export const Tools: Record<string, Tool> = {
    waterTool: WaterTool,
    groundTool: GroundTool,
    shapeTool: ShapeTool,
    wallTool: WallTool,
    decorationTool: DecorationTool,
    objectTool: ObjectTool,
    npcTool: NpcTool,
    itemTool: ItemTool,
    BlockTool: BlockTool,
    npcAvoidTool: NpcAvoidTool,
    islandTool: IslandTool,
    warpTool: WarpTool,
    triggerTool: TriggerTool
};

export type ToolId = keyof typeof Tools;
