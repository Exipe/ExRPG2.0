
import { Connection } from "../connection/connection"
import { Packet, MovePlayerPacket, MessagePacket, OutgoingPlayer, UpdatePlayerAppearancePacket, WelcomePacket, DialoguePacket, CloseWindowPacket, SwingItemPacket, HealthPacket, BrightnessPacket, ChatBubblePacket, DynamicWeatherPacket } from "../connection/outgoing-packet"
import { Character } from "../character/character"
import { playerHandler, actionHandler, npcHandler, weatherHandler } from "../world"
import { Equipment, EquipSlot } from "../item/equipment"
import { ObjectData } from "../object/object-data"
import { Dialogue } from "./window/dialogue"
import { Progress } from "./progress/progress"
import { loadProgress } from "./progress/load-progress"
import { PlayerAttribHandler, properAttrib } from "./attrib"
import { PlayerCombatHandler } from "../combat/player-combat"
import { speedBonus } from "../util/formula"
import { MapId } from "../scene/map-id"
import { PlayerLevel } from "./player-level"
import { FoodHandler } from "../item/food-handler"
import { PrimaryWindow, WindowId } from "./window/p-window"
import { Color, Colors, cyan, yellow } from "../util/color"
import { currentTime, formatStrings, timeSince } from "../util/util"
import { Container } from "../item/container/container"
import { Bank } from "../item/container/bank"
import { Inventory } from "../item/container/inventory"
import { TradeHandler } from "./trade/trade-handler"
import { TradeScreen } from "./trade/trade-screen"
import { BankWindow } from "./window/bank-window"

export function isPlayer(character: Character): character is Player {
    return character.type == "player"
}

export const SPAWN_POINT = [ "newbie_village", 11, 10 ] as [ MapId, number, number ]

export class Player extends Character {

    private readonly connection: Connection

    public readonly persistentId: string

    public readonly id: number
    public readonly name: string

    private readonly progress: Progress

    public readonly equipment = new Equipment(this)
    private readonly _inventory = new Inventory(this)
    public readonly bank = new Bank(this)
    public readonly attributes = new PlayerAttribHandler(this)

    /**
     * The player's inventory container
     * Takes extra care to make sure the player's window is properly closed
     * This behavious can be overriden using the 'windowInventory' method
     */
    public get inventory() {
        this.closeWindow()
        return this._inventory
    }

    public windowInventory(win: WindowId) {
        if(this._window == null || this._window.id != win) {
            throw new Error(`Window '${win}' was not open`)
        }

        return this._inventory
    }

    private _window: PrimaryWindow = null

    private dialogueId = -1

    public readonly level = new PlayerLevel(this)
    public readonly foodHandler = new FoodHandler(this)

    public readonly playerCombat: PlayerCombatHandler

    public rank = 0

    public mute = false

    private vars: Map<string, any> = new Map<string, any>();

    constructor(connection: Connection, persistentId: string, id: number, name: string, progress = null as Progress) {
        super("player", id)
        this.persistentId = persistentId

        this.combatHandler = this.playerCombat = new PlayerCombatHandler(this)
        this.level.setLevel(1, false)

        connection.player = this
        this.connection = connection
        
        this.id = id
        this.name = name
        this.progress = progress

        this.attributes.onChange('speed_move', value => this.walkSpeed = speedBonus(value))
    }

    public get varKeys() {
        return [...this.vars.keys()];
    }

    public getVar<T>(key: string) {
        return this.vars.get(key) as T;
    }

    public setVar<T>(key: string, value: T) {
        if(typeof value != "number" && typeof value != "string" && typeof value != "boolean") {
            throw new Error("Value must be of type 'number', 'string' or 'boolean'");
        }

        this.vars.set(key, value);
    }

    public kick() {
        this.connection.close()
    }

    public unlockedRecipes = [] as string[]

    private actionTimeStamp = 0

    public inTimeLimit(limit: number) {
        if(timeSince(this.actionTimeStamp) < limit) {
            return false
        }

        this.actionTimeStamp = currentTime()
        return true
    }

    public get title() {
        switch(this.rank) {
            case 1:
                return "dev"
            default:
                return "player"
        }
    }

    public getContainer(id: string): Container {
        switch(id) {
            case "inventory":
                return this._inventory
            case "bank":
                return (this.window instanceof BankWindow)
                    ? this.bank : null
            case "trade":
                return (this.window instanceof TradeScreen)
                    ? this.window.container : null
        }

        throw new Error(`Invalid container id: ${id}`)
    }

    public set window(window: PrimaryWindow) {
        if(this._window != null) {
            this.closeWindow()
        }

        this._window = window
        window.open(this)
    }

    public closeWindow(id: WindowId | "Any" = "Any") {
        if(this._window == null || (id != "Any" && this._window.id != id)) {
            return
        }

        const win = this._window
        this._window = null

        if(win.close) {
            win.close(this)
        }

        this.send(new CloseWindowPacket())
    }

    public get window() {
        return this._window
    }

    public get connectionState() {
        return this.connection.state
    }

    public sendDialogue(dialogue: Dialogue) {
        this.send(new DialoguePacket(++this.dialogueId, dialogue.name, dialogue.lines, dialogue.options))
    }

    public handleDialogueOption(dialogueId: number, index: number) {
        if(this.dialogueId != dialogueId || !(this.window instanceof Dialogue)) {
            return
        }

        const next = this.window.handleOption(index)
        if(next != null) {
            this.window = next
        } else {
            this.closeWindow("Dialogue")
        }
    }

    public stop() {
        super.stop()
        this.closeWindow()
    }

    public get outgoingPlayer(): OutgoingPlayer {
        return {
            id: this.id,
            name: this.name,
            rank: this.title,
            x: this.x,
            y: this.y,
            equipment: this.equipment.appearanceValues
        }
    }

    public ready() {
        this.send(new BrightnessPacket(weatherHandler.brightness))
        this.send(new DynamicWeatherPacket(weatherHandler.dynamicWeatherActive));
        this.send(new WelcomePacket(this.id, this.name))
        this.sendMessage("Welcome to ExRPG.")

        if(this.progress != null) {
            loadProgress(this, this.progress)
        } else {
            this.inventory.add("beta_hat", 1)
            this.goTo(...SPAWN_POINT)
        }

        this.level.update()

        this.playerCombat.updateHealth()

        this.connection.state = "playing"
    }

    protected enterMap() {
        this.map.addPlayer(this)
    }

    protected onLeaveMap(): void {
        this.map.removePlayer(this)
    }

    public initWalking() {
        if(!this.taskHandler.interruptible) {
            return false;
        }

        this.stop();
        return true;
    }

    public set goal(goal: () => void) {
        if(!this.taskHandler.interruptible) {
            return;
        }

        this.walking.goal = goal
    }

    public addSteps(goalX: number, goalY: number) {
        return this.walking.addSteps(goalX, goalY)
    }

    public readonly tradeHandler = new TradeHandler(this)

    public trade(other: Player) {
        this.goal = () => {
            this.tradeHandler.trade(other.tradeHandler)
        }
    }

    public takeItem(id: number) {
        const item = this.map.getItem(id)
        
        if(item != null && item.isVisible(this) && item.x == this.x && item.y == this.y) {
            item.remove()
            const remaining = this.inventory.addData(item.itemData, item.amount)

            if(remaining > 0) {
                this.map.dropItem(item.itemData, remaining, 
                    this.x, this.y, [this])
            }
        }
    }

    public objectAction(obj: ObjectData, x: number, y: number, action: string) {
        if(!this.map.reachesObject(this.x, this.y, obj, x, y)) {
            return
        }

        actionHandler.objectAction(this, obj.id, action, x, y)
    }

    public npcAction(id: number, action: string) {
        this.unfollow()
        const npc = npcHandler.get(id)

        if(npc == null || !this.isAdjacent(npc)) {
            return
        }

        actionHandler.npcAction(this, npc, action)
    }

    public walk(x: number, y: number) {
        const trigger = this.map.getTrigger(x, y)
        if(trigger != null) {
            trigger.walked(this)
            return
        } else {
            super.walk(x, y)
        }
    }

    protected onMove(delay: number): void {
        this.map.broadcast(new MovePlayerPacket(this.id, this.x, this.y, delay))
    }

    public send(packet: Packet) {
        this.connection.send(packet)
    }

    private get updateAppearancePacket() {
        return new UpdatePlayerAppearancePacket(
            this.id,
            this.equipment.appearanceValues
        )
    }

    public equipItem(slot: number) {
        const item = this.inventory.get(slot).data
        const missingReqs = item.equipReqs
            .filter(r => r[1] > this.attributes.getBase(r[0]))
            .map(r => `at least ${r[1]} ${properAttrib(r[0])}`) // at least x attrib_name

        if(missingReqs.length > 0) {
            this.sendMessage(formatStrings(missingReqs, 'You need ', ' & ', ' to equip this item.'))
            return
        }

        this.inventory.emptySlot(slot)
        const unequipped = this.equipment.set(item.equipSlot, item)
        if(unequipped != null) {
            this.inventory.addData(unequipped, 1)
            this.attributes.unsetArmor(unequipped, false)
        }
        this.attributes.setArmor(item)
        this.combatHandler.updateStrategy()

        playerHandler.broadcast(this.updateAppearancePacket)
    }

    public unequipItem(slot: EquipSlot) {
        if(!this.inventory.hasSpace()) {
            return
        }

        const unequipped = this.equipment.remove(slot)
        this.inventory.addData(unequipped, 1, true)
        this.attributes.unsetArmor(unequipped)
        this.combatHandler.updateStrategy()

        playerHandler.broadcast(this.updateAppearancePacket)
    }

    public dropItem(slot: number) {
        const item = this.inventory.emptySlot(slot)
        this.map.dropItem(item.data, item.amount, this.x, this.y, [this])
    }

    public say(message: string) {
        if(this.mute) {
            this.sendMessage(Colors.yellow, "You are muted")
            return
        }

        this.sendChatBubble(message)

        let format = this.rank == 1 ? '/sprite(ui/crown)' : ''
        format += ` ${yellow} {}`
        playerHandler.globalMessage(format, this.name+":", message)
    }

    public sendMessage(...message: string[]) {
        this.send(new MessagePacket(message))
    }

    public sendNotification(message: string, color = cyan) {
        this.sendMessage(color.toString(), message)
    }

    public remove() {
        playerHandler.remove(this)
        super.remove()
    }

}