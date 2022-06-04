
import { Player, PlayerInfo } from "./character/player";
import { Scene, Engine, TILE_SIZE, Sprite } from "exrpg";
import { Npc, NpcInfo } from "./character/npc";
import { Connection } from "../connection/connection";
import { WalkPacket } from "../connection/packet";
import { InventoryModel } from "./model/tab/inventory-model";
import { GroundItem } from "./ground-item";
import { ContextMenuModel } from "./model/context-menu-model";
import { EquipmentModel } from "./model/tab/equipment/equipment-model";
import { DialogueModel } from "./model/window/dialogue-model";
import { ChatModel } from "./model/chat-model";
import { OverlayAreaModel } from "./model/overlay-model";
import { StatusModel } from "./model/status-model";
import { SettingsModel } from "./model/tab/settings-model";
import { ShopModel } from "./model/window/shop-model";
import { Observable } from "../util/observable";
import { CraftingModel } from "./model/window/crafting-model";
import { BankModel } from "./model/window/bank-model";
import { TradeModel } from "./model/window/trade-model";
import { PathFinderWorker } from "./path-finder/path-finder-worker";
import { Goal } from "./path-finder/path-finder-types";

export type PrimaryWindow = "None" | "Shop" | "Dialogue" | "Crafting" | "Bank" | "Trade"

export class Game {

    public readonly engine: Engine
    public readonly connection: Connection

    private readonly pathFinderWorker: PathFinderWorker;

    private players: Player[] = []
    private npcs: Npc[] = []
    private tempObjects: [string, number, number][] = []
    private groundItems: GroundItem[] = []

    public localId = -1

    public readonly ctxMenu = new ContextMenuModel()
    public readonly dialogue: DialogueModel
    public readonly inventory: InventoryModel
    public readonly equipment: EquipmentModel
    public readonly chat: ChatModel
    public readonly overlayArea: OverlayAreaModel
    public readonly status = new StatusModel()
    public readonly settings: SettingsModel
    public readonly shop: ShopModel
    public readonly crafting = new CraftingModel(this)
    public readonly bank: BankModel
    public readonly trade: TradeModel

    public readonly primaryWindow = new Observable<PrimaryWindow>("None")

    public createPlayer: (equipment: string[], info: PlayerInfo) => Player;
    public createNpc: (info: NpcInfo) => Npc;
    public updatePlayerAppearance: (id: number, equipment: string[]) => void;

    constructor(engine: Engine, connection: Connection, pathFinderWorker: PathFinderWorker) {
        this.engine = engine
        this.connection = connection
        this.pathFinderWorker = pathFinderWorker

        this.dialogue = new DialogueModel(connection)
        this.inventory = new InventoryModel(connection)
        this.equipment = new EquipmentModel(connection)
        this.overlayArea = new OverlayAreaModel(engine.camera)
        this.chat = new ChatModel(connection)
        this.settings = new SettingsModel(engine)
        this.shop = new ShopModel(this.primaryWindow, connection)
        this.bank = new BankModel(this.primaryWindow, connection)
        this.trade = new TradeModel(this.primaryWindow, connection)
    }

    private updateBlockMap() {
        const map = this.engine.map
        const width = map.width
        const height = map.height

        const grid = [] as boolean[][]
        for(let y = 0; y < height; y++) {
            let row = []

            for(let x = 0; x < width; x++) {
                row.push(map.isBlocked(x, y))
            }
            grid.push(row)
        }

        this.pathFinderWorker.setBlockMap({ grid, width, height });
    }

    private get map() {
        return this.engine.map
    }

    private targetX = -1
    private targetY = -1

    private followMouse() {
        const input = this.engine.inputHandler
        const camera = this.engine.camera
        if(!input.isMouseDown || !input.clickedGround) {
            return
        }

        const [mouseX, mouseY] = camera.translateClick(input.mouseX, input.mouseY)
        const tileX = Math.floor(mouseX / TILE_SIZE)
        const tileY = Math.floor(mouseY / TILE_SIZE)
        if(tileX == this.targetX && tileY == this.targetY) {
            return
        }

        this.walkTo(tileX, tileY)
    }

    public update() {
        this.followMouse()
    }

    public async walkTo(x: number, y: number) {
        if(this.map == null || this.map.isBlocked(x, y)) {
            return
        }

        await this.walkToGoal({
            x: x, y: y, width: 1, height: 1,
            distance: 0
        })
    }

    public async walkToGoal(goal: Goal) {
        const player = this.getLocal()
        const islandMap = this.map.islandMap
        const playerIsland = islandMap.get(player.tileX, player.tileY)
        const goalIsland = islandMap.get(Math.floor(goal.x), Math.floor(goal.y))

        if(playerIsland != goalIsland) {
            return
        }

        this.targetX = goal.x
        this.targetY = goal.y
        const map = this.map

        const path = await this.pathFinderWorker.findPath(player.tileX, player.tileY, goal)
        if(this.map != map) {
            return
        }

        this.connection.send(new WalkPacket(path))
    }

    public enterMap(map: Scene) {
        this.engine.map = map
        const updateBlockMap = () => this.updateBlockMap()
        map.onBlockMapChange = updateBlockMap
        updateBlockMap()

        this.settings.updateBoundary()

        this.players.forEach(p => {
            map.addEntity(p)
        })

        this.npcs.forEach(n => {
            map.addEntity(n)
        })

        this.tempObjects.forEach(obj => {
            map.builder.putObject(obj[1], obj[2], obj[0])
        })
        this.tempObjects = []

        this.groundItems.forEach(i => {
            map.addItem(i)
        })

        this.engine.camera.follow(this.getLocal())
    }

    public addPlayer(player: Player) {
        this.players.push(player)
        
        if(this.map != null) {
            this.map.addEntity(player)
        }
    }

    public addNpc(npc: Npc) {
        this.npcs.push(npc)
        if(this.map != null) {
            this.map.addEntity(npc)
        }
    }

    public setObject(objId: string, x: number, y: number) {
        if(this.map != null) {
            this.map.builder.putObject(x, y, objId)
        } else {
            this.tempObjects.push([objId, x, y])
        }
    }

    public addGroundItem(item: GroundItem) {
        this.groundItems.push(item)
        if(this.map != null) {
            this.map.addItem(item)
        }
    }

    public clear() {
        if(this.engine.map != null) {
            this.engine.map.destroy()
        }

        this.pathFinderWorker.clearBlockMap()
        this.engine.map = null
        this.players = []
        this.npcs = []
        this.groundItems = []
    }

    public removePlayer(id: number) {
        this.players = this.players.filter(p => {
            if(p.id == id) {
                p.destroy()
                return false
            } else {
                return true
            }
        })
    }

    public removeNpc(id: number) {
        this.npcs = this.npcs.filter(n => {
            if(n.id == id) {
                n.destroy()
                return false
            } else {
                return true
            }
        })
    }

    public removeGroundItem(id: number) {
        this.groundItems = this.groundItems.filter(i => {
            if(i.id == id) {
                this.map.removeItem(i)
                return false
            } else {
                return true
            }
        })
    }

    public getNpc(id: number) {
        return this.npcs.find(n => n.id == id)
    }

    public getPlayer(id: number) {
        return this.players.find(p => p.id == id)
    }

    public getLocal() {
        return this.getPlayer(this.localId)
    }

}