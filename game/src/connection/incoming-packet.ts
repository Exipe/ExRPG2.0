
import { ItemData, loadScene } from "exrpg";
import { Item } from "../game/model/container-model"
import { Game } from "../game/game";
import { ContainerModel } from "../game/model/container-model";
import { CraftingStation, Recipe } from "../game/model/window/crafting-model";
import { Dialogue } from "../game/model/window/dialogue-model";
import { HitSplatStyle } from "../game/model/overlay-model";
import { ShopSelect, Shop } from "../game/model/window/shop-model";
import { ItemSwingComponent } from "../game/character/component/item-swing";
import { AttribId, Attributes } from "../game/model/tab/equipment/attributes";
import { ChatBubbleComponent, CHAT_BUBBLE_COMPONENT } from "../game/character/component/chat-bubble";
import { HealthBarComponent } from "../game/character/component/health-bar";

function onEquipment(game: Game, equipment: any) {
    const engine = game.engine
    const equippedItems = new Map<string, ItemData>()
    equipment.forEach((equip: [string, string]) => {
        const id = equip[1]
        const item = id == "" ? null : engine.itemHandler.get(id)
        equippedItems.set(equip[0], item)
    });

    game.equipment.equippedItems.value = equippedItems
}

function onAttrib(game: Game, data: any) {
    const attribs = new Attributes()
    attribs.points = data.points

    const values = data.attribs as [AttribId, number, number][]
    values.forEach(value => {
        attribs.set(value[0], {
            total: value[1] + value[2],
            value: value[1],
            armor: value[2]
        })
    })

    game.equipment.attributes.value = attribs
}

function onSwingItem(game: Game, data: any) {
    const engine = game.engine
    const spritePromise = engine.itemHandler.get(data.itemId).getSprite(engine)
    const character = data.character == "player" ? game.getPlayer(data.characterId) 
        : game.getNpc(data.characterId)
    
    const swingItem = new ItemSwingComponent(spritePromise, character,
        data.offX, data.offY, data.duration)
    character.componentHandler.add(swingItem)
}

function onHitSplat(game: Game, data: any) {
    const character = data.character == "player" ? game.getPlayer(data.characterId) 
        : game.getNpc(data.characterId)
    let style: HitSplatStyle = data.type
    let hit = data.damage

    const coords = character.centerCoords
    game.overlayArea.addHitSplat(hit, style, coords[0], coords[1], 2000)
}

function onProgressIndicator(game: Game, data: any) {
    const character = data.character == "player" ? game.getPlayer(data.characterId)
        : game.getNpc(data.characterId)

    if(data.remove) {
        character.progressIndicatorComponent
            .removeIndicator()
        return
    }
        
    character.progressIndicatorComponent
        .addIndicator(data.item, data.duration)
}

function onChatBubble(game: Game, data: any) {
    const character = data.character == "player" ? game.getPlayer(data.characterId)
        : game.getNpc(data.characterId)

    const component = character.componentHandler.get(CHAT_BUBBLE_COMPONENT) as ChatBubbleComponent
    if(component == null) {
        return
    }
    component.message = data.message
}

function onHealthBar(game: Game, data: any) {
    const character = data.character == "player" ? game.getPlayer(data.characterId) 
        : game.getNpc(data.characterId)

    character.healthBarComponent.healthRatio = data.ratio
}

function onHealth(game: Game, data: any) {
    game.status.health.value = data.health
    game.status.totalHealth.value = data.totalHealth
}

function onBrightness(game: Game, brightness: number) {
    game.engine.lightHandler.brightness = brightness
}

async function onLoadMap(game: Game, mapId: string) {
    game.clear()

    const mapData = await fetch("res/map/" + mapId + ".json").then(res => res.text())
    const map = loadScene(game.engine, mapData)
    map.attribLayer.visible = false

    game.enterMap(map)
}

async function onSetObject(game: Game, objects: [string, number, number][]) {
    objects.forEach(o => {
        game.setObject(o[0], o[1], o[2])
    })
}

function onLevel(game: Game, data: any) {
    game.status.level.value = data.level
    game.status.experience.value = data.experience
    game.status.requiredExperience.value = data.requiredExperience
}

function onCloseWindow(game: Game, _: any) {
    game.primaryWindow.value = "None"
}

function onOpenDialogue(game: Game, data: any) {
    const dialogue = new Dialogue(data.id, data.name, data.lines, data.options)
    game.dialogue.observable.value = dialogue
    game.primaryWindow.value = "Dialogue"
}

function onOpenTrade(game: Game, data: string) {
    game.trade.open(data)
}

function onUpdateTrade(game: Game, data: any) {
    const itemHandler = game.engine.itemHandler

    const items: Item[] = data.items.map(item => (
        item != null ? [itemHandler.get(item[0]), item[1]] : null
    ))
    const container = new ContainerModel(items)

    if(data.target == 'self') {
        game.trade.tradeOffer.observable.value = container
    } else if(data.target == 'other') {
        game.trade.otherOffer.value = container
    }
}

function onBank(game: Game, data: [string, number][]) {
    const itemHandler = game.engine.itemHandler

    const items: Item[] = data.map(item => (
        item != null ? [itemHandler.get(item[0]), item[1]] : null
    ))
    const container = new ContainerModel(items)

    if(game.primaryWindow.value == "Bank") {
        game.bank.observable.value = container
    } else {
        game.bank.open(container)
    }
}

function onOpenShop(game: Game, data: any) {
    const shop = new Shop(data.name, data.items.map((id: string) =>
        game.engine.itemHandler.get(id)))
    game.shop.open(shop)
}

function onSelectBuy(game: Game, data: any) {
    const itemHandler = game.engine.itemHandler
    const item = itemHandler.get(data.item)
    const currency = itemHandler.get(data.currency)
    game.shop.selectedBuy.value = new ShopSelect(data.slot, item, currency, data.price)
}

function onSelectSell(game: Game, data: any) {
    const itemHandler = game.engine.itemHandler
    const item = itemHandler.get(data.item)
    const currency = itemHandler.get(data.currency)
    game.shop.selectedSell.value = new ShopSelect(data.slot, item, currency, data.value)
}

function onOpenCrafting(game: Game, data: any) {
    const itemHandler = game.engine.itemHandler
    const station = new CraftingStation(data.name, data.recipes.map((recipe: any) => ({
        item: itemHandler.get(recipe.item),
        unlocked: recipe.unlocked,
        materials: recipe.materials.map((i: any) => [itemHandler.get(i[0]), i[1]])
    })))
    game.crafting.open(station)
}

export function bindIncomingPackets(game: Game) {
    const connection = game.connection

    let bind = (packet: string, listener: (game: Game, data: any) => void) => {
        connection.on(packet, data => listener(game, data))
    }

    bind("EQUIPMENT", onEquipment)
    bind("ATTRIB", onAttrib)
    bind("SWING_ITEM", onSwingItem)
    bind("HIT_SPLAT", onHitSplat)
    bind("PROGRESS_INDICATOR", onProgressIndicator)
    bind("CHAT_BUBBLE", onChatBubble)
    bind("HEALTH_BAR", onHealthBar)
    bind("HEALTH", onHealth)
    bind("LOAD_MAP", onLoadMap)
    bind("SET_OBJECT", onSetObject)
    bind("BRIGHTNESS", onBrightness)
    bind("LEVEL", onLevel)
    bind("CLOSE_WINDOW", onCloseWindow)
    bind("DIALOGUE", onOpenDialogue)
    bind("BANK", onBank)
    bind("OPEN_TRADE", onOpenTrade)
    bind("UPDATE_TRADE", onUpdateTrade)
    bind("SHOP", onOpenShop)
    bind("SELECT_BUY", onSelectBuy)
    bind("SELECT_SELL", onSelectSell)
    bind("CRAFTING", onOpenCrafting)
}