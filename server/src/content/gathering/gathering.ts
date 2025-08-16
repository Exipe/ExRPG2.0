
import { Player } from "../../player/player";
import { Scene } from "../../scene/scene";
import { ObjectData } from "../../object/object-data";
import { objectDirection, randomInt } from "../../util/util";
import { SwingItemPacket } from "../../connection/outgoing-packet";
import { PrimaryTask } from "../../character/task";

export interface GatheringTool {
    itemId: string;
    hitOutput: [number, number];
}

export abstract class Gathering extends PrimaryTask {
    private readonly map: Scene
    
    constructor(
        protected readonly player: Player, 
        private readonly objData: ObjectData, 
        private readonly objX: number, 
        private readonly objY: number,
        private readonly depletedId: string, 
        public readonly delay: number, 
        private readonly animInterval: number, 
        private readonly respawnTime: number,
        private hitPoints: number
    ) {
        super(player);
        this.map = player.map;
    }

    private get reachesResource() {
        return this.map.reachesObject(this.player.x, this.player.y, this.objData, this.objX, this.objY);
    }

    private get tool() {
        const tiers = this.toolTierList;
        for (let i = tiers.length - 1; i >= 0; i--) {
            const tool = tiers[i];
            if (this.player.inventory.hasItem(tiers[i].itemId)) {
                return tool;
            }
        }
    }

    private get hasTool() {
        return this.tool !== undefined;
    }

    protected abstract get toolTierList(): GatheringTool[];

    protected abstract onLackTool(): void;

    public start() {
        if (!this.hasTool) {
            this.onLackTool();
            return;
        }

        if (!this.player.inventory.hasSpace()) {
            this.player.sendMessage('Your inventory is full.');
            return;
        }

        this.player.taskHandler.setTask(this);
    }

    protected abstract onSuccess(): void

    public tick() {
        if (!this.reachesResource || !this.hasTool) {
            this.player.taskHandler.stopTask(this);
            return;
        }

        let tool = this.tool;
        const [offX, offY] = objectDirection(this.objData, this.objX, this.objY, this.player.x, this.player.y);
        this.map.broadcast(new SwingItemPacket(tool.itemId, "player", this.player.id, offX, offY, this.animInterval));

        this.hitPoints -= randomInt(...tool.hitOutput);
        if (this.hitPoints > 0) {
            return;
        }

        this.player.taskHandler.stopTask(this);
        this.map.addTempObj(this.depletedId, this.objX, this.objY, this.respawnTime);

        this.onSuccess();
    }

    public stop() { }

}
