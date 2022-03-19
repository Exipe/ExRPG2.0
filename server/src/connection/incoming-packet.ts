
import { ConnectionHandler } from "./connection-handler";
import { Connection } from "./connection";
import { isEquipSlot } from "../item/equipment";
import { playerHandler, objDataHandler, npcHandler, commandHandler, actionHandler, itemDataHandler } from "../world";
import { isAttribId } from "../player/attrib";
import { Shop } from "../shop/shop";
import { CraftingStation } from "../crafting/crafting-station";
import { Container } from "../item/container/container";
import { INVENTORY_SIZE } from "../item/container/inventory";
import { BANK_SIZE } from "../item/container/bank";
import { TradeScreen } from "../player/trade/trade-screen";

/*
Handle packet spoofing.
*/
function report(message: string) {
    throw new Error(message)
}

/*
REGISTER packet
*/
function onRegister(conn: Connection, data: any) {
    if(typeof data != "object") {
        report(`Invalid REGISTER data ${data}`)
        return
    }

    const username = data.username
    const password = data.password

    if(typeof username != "string") {
        console.log(`Invalid REGISTER username: ${username}`)
        return
    }

    if(typeof password != "string") {
        console.log(`Invalid REGISTER password: ${password}`)
        return
    }

    playerHandler.register(username, password, conn)
}

/*
LOGIN packet
*/
function onLogin(conn: Connection, data: any) {
    if(typeof data != "object") {
        report(`Invalid LOGIN data ${data}`)
        return
    }

    const username = data.username
    const password = data.password

    if(typeof username != "string") {
        console.log(`Invalid LOGIN username: ${username}`)
        return
    }

    if(typeof password != "string") {
        console.log(`Invalid LOGIN password: ${password}`)
        return
    }

    playerHandler.login(username, password, conn)
}

/*
READY packet
*/
function onReady(conn: Connection, _: any) {
    conn.player.ready()
}

/*
WALK packet
*/
function onWalk(conn: Connection, data: any) {
    if(!Array.isArray(data)) {
        report("Invalid WALK path: " + data)
        return
    }

    let player = conn.player
    player.stop()

    for(const step of data) {
        if(!Array.isArray(step) || isNaN(step[0]) || isNaN(step[1])) {
            report("Invalid WALK step: " + step)
            continue
        }

        if(!player.addSteps(step[0], step[1])) {
            break
        }
    }
}

/*
SAY packet
*/
function onSay(conn: Connection, message: any) {
    if(typeof message != "string") {
        report(`Invalid SAY message: ${message}`)
        return
    }

    if(message.length == 0 || message.length > 100) {
        report(`SAY message too long: ${message}`)
        return
    }

    conn.player.say(message)
}

/*
COMMAND packet
*/
function onCommand(conn: Connection, command: string) {
    if(typeof command != "string") {
        report(`Invalid COMMAND command: ${command}`)
        return
    }

    if(command.length == 0) {
        return
    }

    commandHandler.execute(conn.player, command)
}

function verifySlot(slot: number, size: number) {
    return !isNaN(slot) && slot >= 0 && slot < size
}

function verifyAmount(amount: number) {
    return Number.isInteger(amount) && amount > 0 && amount <= 1_000_000_000
}

/*
MOVE_ITEM packet
*/
function onMoveItem(conn: Connection, data: any) {
    const fromSlot = data.fromSlot
    const toSlot = data.toSlot

    let container: Container
    container = conn.player.getContainer(data.container)

    if(!verifySlot(fromSlot, container.size) || !verifySlot(toSlot, container.size)) {
        report(`Invalid MOVE_ITEM slots: ${fromSlot} -> ${toSlot}`)
        return
    }

    container.swap(fromSlot, toSlot)
}

/*
USE_ITEM packet
*/
function onUseItem(conn: Connection, data: any) {
    const action = data.action
    const id = data.id
    const slot = data.slot

    if(!verifySlot(slot, INVENTORY_SIZE)) {
        report(`Invalid USE_ITEM slot: ${slot}`)
        return
    }

    const player = conn.player
    const item = player.inventory.get(slot)

    if(item == null || item.id != id) {
        return
    }

    if(action == "drop") {
        player.dropItem(slot)
        return
    } else if(action == "equip") {
        if(item.equipable) {
            player.equipItem(slot)
        } else {
            report(`Attempt to equip unequipable item: ${item.id}`)
        }

        return
    }
    
    if(!item.data.actions.includes(action)) {
        report(`Invalid action, ${action} on item: ${item.id}`)
        return
    }

    actionHandler.itemAction(player, item.id, action, slot)
}

/*
TAKE_ITEM packet
*/
function onTakeItem(conn: Connection, id: any) {
    if(isNaN(id)) {
        report(`Invalid TAKE_ITEM ID: ${id}`)
        return
    }

    const player = conn.player
    player.goal = () => {
        player.takeItem(id)
    }
}

/*
TRANSFER packet
*/
function onTransfer(conn: Connection, data: any) {
    if(typeof data != "object") {
        report(`Invalid TRANSFER data: ${data}`)
        return
    }

    const from = data.from
    const to = data.to
    const id = data.item
    const slot = data.slot

    let fromContainer: Container
    let toContainer: Container

    fromContainer = conn.player.getContainer(from)
    toContainer = conn.player.getContainer(to)

    if(!verifySlot(data.slot, fromContainer.size)) {
        report(`Invalid TRANSFER slot: ${slot}`)
        return
    }

    const item = fromContainer.get(slot)

    if(item == null || item.id != id) {
        return
    }

    const amount = data.amount
    if(amount) {
        if(!verifyAmount(amount)) {
            report(`Invalid TRANSFER amount: ${amount}`)
            return
        }

        fromContainer.transferAmount(id, amount, toContainer)
    } else {
        fromContainer.transfer(slot, toContainer)
    }
}

/*
UNEQUIP_ITEM packet
*/
function onUnequipItem(conn: Connection, data: any) {
    if(typeof data != "object") {
        report(`Invalid UNEQUIP_ITEM data: ${data}`)
        return
    }

    const id = data.id
    const slot = data.slot

    if(!isEquipSlot(slot)) {
        report(`Invalid UNEQUIP_ITEM slot: ${slot}`)
        return
    }

    const player = conn.player
    const item = player.equipment.get(slot)

    if(item == null || item.id != id) {
        return
    }

    player.unequipItem(slot)
}

/*
SPEND_POINTS packet
*/
function onSpendPoints(conn: Connection, data: any) {
    if(!Array.isArray(data)) {
        report(`Invalid SPEND_POINTS data: ${data}`)
        return
    }

    const playerAttribs = conn.player.attributes

    for(const attribute of data) {
        const valid = Array.isArray(attribute)
            && attribute.length == 2
            && isAttribId(attribute[0])
            && attribute[1] <= playerAttribs.getPoints()

        if(!valid) {
            report(`Invalid SPEND_POINTS row: ${attribute}`)
            continue
        }

        playerAttribs.spendPoints(attribute[0], attribute[1], false)
    }

    playerAttribs.update()
}

/*
OBJECT_ACTION packet
*/
function onObjectAction(conn: Connection, data: any) {
    if(typeof data != "object") {
        report(`Invalid OBJECT_ACTION data: ${data}`)
        return
    }

    const objId = data.id
    const action = data.action
    const x = data.x
    const y = data.y

    const obj = objDataHandler.get(objId);
    if(obj == null) {
        report(`Invalid OBJECT_ACTION id: ${objId}`)
        return
    }

    if(obj.actions.find(a => a == action) == null) {
        report(`Invalid OBJECT_ACTION action: ${action}`)
        return
    }

    if(isNaN(x) || isNaN(y)) {
        report(`Invalid OBJECT_ACTION coords: ${x}, ${y}`)
        return
    }

    const player = conn.player
    player.goal = () => {
        player.objectAction(obj, x, y, action)
    }
}

/*
PLAYER_ACTION packet
*/
function onPlayerAction(conn: Connection, data: any) {
    if(typeof data != "object") {
        report(`Invalid PLAYER_ACTION data: ${data}`)
        return
    }

    const id = data.id as number

    if(isNaN(id) || id < 0) {
        report(`Invalid PLAYER_ACTION id: ${id}`)
        return
    }

    const other = playerHandler.get(id)
    const self = conn.player

    if(other == null || other.map != self.map) {
        return
    }

    const action = data.action

    switch(action) {
        case "attack":
            self.attack(other)
            break
        case "follow":
            self.follow(other)
            break
        case "trade":
            self.trade(other)
            break
        default:
            throw new Error(`Invalid PLAYER_ACTION action: ${action}`)
    }
}

/*
NPC_ACTION packet
*/
function onNpcAction(conn: Connection, data: any) {
    if(typeof data != "object") {
        report(`Invalid NPC_ACTION data: ${data}`)
        return
    }

    const id = data.id as number

    if(isNaN(id)) {
        report(`Invalid NPC_ACTION id: ${id}`)
        return
    }

    const other = npcHandler.get(id)
    const self = conn.player

    if(other == null || other.map != self.map) {
        return
    }

    const action = data.action

    if(action == "__attack" && other.attackable) {
        self.attack(other)
        return
    }

    if(other.data.actions.find(a => a == action) == null) {
        report(`Invalid NPC_ACTION action: ${action}`)
        return
    }

    self.follow(other)
    self.goal = () => {
        self.npcAction(id, action)
    }
}

/*
DIALOGUE_OPTION packet
*/
function onDialogueOption(conn: Connection, data: any) {
    if(typeof data != "object") {
        report(`Invalid DIALOGUE_OPTION data: ${data}`)
        return
    }

    const id = data.id
    const index = data.index

    if(isNaN(id)) {
        report(`Invalid DIALOGUE_OPTION id: ${id}`)
        return
    }

    if(isNaN(index)) {
        report(`Invalid DIALOGUE_OPTION index: ${index}`)
        return
    }

    conn.player.handleDialogueOption(id, index)
}

/*
SELECT_BUY packet
*/
function onSelectBuy(conn: Connection, slot: any) {
    if(isNaN(slot) || slot < 0 || slot >= 48) {
        report(`Invalid SELECT_BUY slot: ${slot}`)
        return
    }

    const player = conn.player
    const shop = player.window
    if(!(shop instanceof Shop)) {
        return
    }

    shop.selectBuy(player, slot)
}

/*
CONFIRM_BUY packet
*/
function onConfirmBuy(conn: Connection, data: any) {
    if(typeof data != "object") {
        report(`Invalid CONFIRM_BUY data: ${data}`)
        return
    }

    const slot = data.slot
    const amount = data.amount

    if(isNaN(slot) || slot < 0 || slot >= 48) {
        report(`Invalid CONFIRM_BUY slot: ${slot}`)
        return
    }

    if(!verifyAmount(amount)) {
        report(`Invalid CONFIRM_BUY amount: ${amount}`)
        return
    }

    const player = conn.player
    const shop = player.window
    if(!(shop instanceof Shop)) {
        return
    }

    shop.buy(player, slot, amount)
}

/*
SELECT_SELL packet
*/
function onSelectSell(conn: Connection, slot: any) {
    if(!verifySlot(slot, INVENTORY_SIZE)) {
        report(`Invalid SELECT_SELL slot: ${slot}`)
        return
    }

    const player = conn.player
    const shop = player.window
    if(!(shop instanceof Shop)) {
        return
    }

    shop.selectSell(player, slot)
}

function onConfirmSell(conn: Connection, data: any) {
    if(typeof data != "object") {
        report(`Invalid CONFIRM_SELL data: ${data}`)
        return
    }

    const item = itemDataHandler.get(data.item)
    const amount = data.amount

    if(item == null || item.value == 0) {
        report(`Invalid CONFIRM_SELL item: ${data.item}`)
        return
    }

    if(!verifyAmount(amount)) {
        report(`Invalid CONFIRM_SELL amount: ${amount}`)
        return
    }

    const player = conn.player
    const shop = player.window
    if(!(shop instanceof Shop)) {
        return
    }

    shop.sell(player, item, amount)
}

/*
TRADE_STATUS packet
*/
function onTradeStatus(conn: Connection, status: "accept" | "decline") {
    if(status != "accept" && status != "decline") {
        report(`Invalid TRADE_STATUS: ${status}`)
        return
    }

    const player = conn.player
    const trade = player.window
    if(!(trade instanceof TradeScreen)) {
        return
    }

    switch(status) {
        case "accept":
            trade.accept(player)
            break
        case "decline":
            player.closeWindow()
            break
    }    
}

function onCraft(conn: Connection, data: any) {
    if(typeof data != "object") {
        report(`Invalid CRAFT data: ${data}`)
        return
    }

    const item = itemDataHandler.get(data.item)
    const amount = data.amount

    if(item == null) {
        report(`Invalid CRAFT item: ${data.item}`)
        return
    }

    if(!verifyAmount(amount)) {
        report(`Invalid CRAFT amount: ${amount}`)
        return
    }

    const player = conn.player
    const station = player.window
    if(!(station instanceof CraftingStation)) {
        return
    }

    station.craft(player, item, amount)
}

export function bindIncomingPackets(ch: ConnectionHandler) {
    ch.on("LOGIN", onLogin, "initial")
    ch.on("REGISTER", onRegister, "initial")

    ch.on("READY", onReady, "connected")

    ch.on("WALK", onWalk)
    ch.on("SAY", onSay)
    ch.on("COMMAND", onCommand)
    ch.on("MOVE_ITEM", onMoveItem)
    ch.on("USE_ITEM", onUseItem)
    ch.on("TAKE_ITEM", onTakeItem)
    ch.on("UNEQUIP_ITEM", onUnequipItem)
    ch.on("TRANSFER", onTransfer)
    ch.on("SPEND_POINTS", onSpendPoints)
    ch.on("OBJECT_ACTION", onObjectAction)
    ch.on("PLAYER_ACTION", onPlayerAction)
    ch.on("NPC_ACTION", onNpcAction)
    ch.on("DIALOGUE_OPTION", onDialogueOption)
    ch.on("SELECT_BUY", onSelectBuy)
    ch.on("CONFIRM_BUY", onConfirmBuy)
    ch.on("SELECT_SELL", onSelectSell)
    ch.on("CONFIRM_SELL", onConfirmSell)
    ch.on("TRADE_STATUS", onTradeStatus)
    ch.on("CRAFT", onCraft)
}