
import { ItemData, loadScene, Sprite } from "exrpg";
import { ItemModel } from "../game/model/container-model"
import { Game } from "../game/game";
import { ContainerModel } from "../game/model/container-model";
import { CraftingStation } from "../game/model/window/crafting-model";
import { Dialogue } from "../game/model/window/dialogue-model";
import { HitSplatStyle } from "../game/model/overlay-model";
import { ShopSelect, Shop } from "../game/model/window/shop-model";
import { ItemSwingComponent } from "../game/character/component/item-swing";
import { AttribId, Attributes } from "../game/model/tab/equipment/attributes";
import { ChatBubbleComponent, CHAT_BUBBLE_COMPONENT } from "../game/character/component/chat-bubble";
import { NpcInfo } from "../game/character/npc";
import { GroundItem } from "../game/ground-item";
import { ItemPointComponent, ITEM_POINT_COMPONENT } from "../game/character/component/item-point";
import { ProjectileComponent } from "../game/character/component/projectile";

//#region Player packets

function onWelcome(game: Game, data: any) {
    game.localId = data.id
    game.status.name.value = data.name
}

function onAddPlayer(game: Game, data: any) {
    data.forEach((p: any) => {
        const player = game.createPlayer(p.equipment, p);
        game.addPlayer(player);
    });
}

function onPlayerAppearance(game: Game, data: any) {
    game.updatePlayerAppearance(data.id, data.equipment);
}

function onRemovePlayer(game: Game, id: number) {
    game.removePlayer(id);
}

function onMovePlayer(game: Game, data: any) {
    const player = game.getPlayer(data.id)

    if (data.animate) {
        player.walkTo(data.x, data.y, data.animationSpeed)
    } else {
        player.place(data.x, data.y)
    }
}

//#endregion

//#region Npc packets

function onAddNpc(game: Game, data: any) {
    data.forEach((n: [number, string, number, number]) => {
        const info: NpcInfo = {
            id: n[0],
            dataId: n[1],
            x: n[2],
            y: n[3]
        }

        const npc = game.createNpc(info)
        game.addNpc(npc)
    })
}

function onMoveNpc(game: Game, data: any) {
    const npc = game.getNpc(data.id);

    if (data.animate) {
        npc.walkTo(data.x, data.y, data.animationSpeed)
    } else {
        npc.place(data.x, data.y)
    }
}

function onRemoveNpc(game: Game, id: number) {
    game.removeNpc(id);
}

//#endregion

//#region Ground items

function onAddGroundItem(game: Game, data: any) {
    data.forEach((i: [number, string, number, number]) => {
        const item = new GroundItem(game.engine, i[0], i[1], i[2], i[3])
        game.addGroundItem(item)
    })
}

function onRemoveGroundItem(game: Game, id: number) {
    game.removeGroundItem(id);
}

//#endregion

//#region Inventory

function onInventory(game: Game, data: [string, number][]) {
    const engine = game.engine;
    const items: ItemModel[] = data.map(item => (
        item != null ? [engine.itemHandler.get(item[0]), item[1]] : null
    ))
    game.inventory.observable.value = new ContainerModel(items)
}

//#endregion

//#region Equipment

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

//#endregion

//#region Item animations

function onSwingItem(game: Game, data: any) {
    const engine = game.engine
    const spritePromise = engine.itemHandler.get(data.itemId).getSprite(engine)
    const character = data.character == "player" ? game.getPlayer(data.characterId)
        : game.getNpc(data.characterId)

    const swingItem = new ItemSwingComponent(spritePromise, character,
        data.offX, data.offY, data.duration)
    character.componentHandler.add(swingItem)
}

function onPointItem(game: Game, data: any) {
    const engine = game.engine;
    const spritePromise = engine.itemHandler.get(data.itemId)
        .getSprite(engine);
    const character = data.character.characterType == "player" ? game.getPlayer(data.character.id)
        : game.getNpc(data.character.id);
    const target = data.target.characterType == "player" ? game.getPlayer(data.target.id)
        : game.getNpc(data.target.id);
    const pointItem = new ItemPointComponent(spritePromise, character, target);
    character.componentHandler.add(pointItem);
}

function onProjectile(game: Game, data: any) {
    const engine = game.engine;
    const spritePromise =
        engine.loadTexture(`projectile/${data.sprite}.png`)
            .then(texture => new Sprite(engine, texture));

    const character = game.getCharacter(data.character.characterType, data.character.id);
    const target = game.getCharacter(data.target.characterType, data.target.id);
    const delay = data.delay;

    const projectile = new ProjectileComponent(spritePromise, target, character, delay);
    target.componentHandler.add(projectile);
}

function onCancelPointItem(game: Game, data: any) {
    const character = data.character.characterType == "player"
        ? game.getPlayer(data.character.id)
        : game.getNpc(data.character.id);
    character.componentHandler.remove(ITEM_POINT_COMPONENT);
}

//#endregion

//#region Overlays

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

    if (data.remove) {
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
    if (component == null) {
        return
    }
    component.showChatBubble(data.message, data.style)
}

function onHealthBar(game: Game, data: any) {
    const character = data.character == "player" ? game.getPlayer(data.characterId)
        : game.getNpc(data.characterId)

    character.healthBarComponent.healthRatio = data.ratio
}

//#endregion

//#region Status

function onHealth(game: Game, data: any) {
    game.status.health.value = data.health
    game.status.totalHealth.value = data.totalHealth
}

function onLevel(game: Game, data: any) {
    game.status.level.value = data.level
    game.status.experience.value = data.experience
    game.status.requiredExperience.value = data.requiredExperience
}

//#endregion

//#region Scene

async function onLoadMap(game: Game, mapId: string) {
    game.clear()

    const mapData = await fetch("res/map/" + mapId + ".json").then(res => res.text())
    const map = loadScene(game.engine, mapData)

    game.enterMap(map)
}

async function onSetObject(game: Game, objects: [string, number, number][]) {
    objects.forEach(o => {
        game.setObject(o[0], o[1], o[2])
    })
}

//#endregion

//#region Window

function onOpenDialogue(game: Game, data: any) {
    const dialogue = new Dialogue(data.id, data.name, data.lines, data.options)
    game.dialogue.observable.value = dialogue
    game.primaryWindow.value = "Dialogue"
}

function onBank(game: Game, data: [string, number][]) {
    const itemHandler = game.engine.itemHandler

    const items: ItemModel[] = data.map(item => (
        item != null ? [itemHandler.get(item[0]), item[1]] : null
    ))
    const container = new ContainerModel(items)

    if (game.primaryWindow.value == "Bank") {
        game.bank.observable.value = container
    } else {
        game.bank.open(container)
    }
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

//#region Trade

function onOpenTrade(game: Game, data: string) {
    game.trade.open(data)
}

function onUpdateTrade(game: Game, data: any) {
    const itemHandler = game.engine.itemHandler

    const items: ItemModel[] = data.items.map(item => (
        item != null ? [itemHandler.get(item[0]), item[1]] : null
    ))
    const container = new ContainerModel(items)

    if (data.target == 'self') {
        game.trade.tradeOffer.observable.value = container
    } else if (data.target == 'other') {
        game.trade.otherOffer.value = container
    }
}

//#endregion

//#region Shop

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

//#endregion

function onCloseWindow(game: Game, _: any) {
    game.primaryWindow.value = "None"
}

//#endregion

export function bindIncomingPackets(game: Game) {
    const connection = game.connection

    let bind = (packet: string, listener: (game: Game, data: any) => void) => {
        connection.on(packet, data => listener(game, data))
    }

    bind("WELCOME", onWelcome)
    bind("ADD_PLAYER", onAddPlayer)
    bind("PLAYER_APPEARANCE", onPlayerAppearance)
    bind("REMOVE_PLAYER", onRemovePlayer)
    bind("MOVE_PLAYER", onMovePlayer)

    bind("ADD_NPC", onAddNpc)
    bind("MOVE_NPC", onMoveNpc)
    bind("REMOVE_NPC", onRemoveNpc)

    bind("ADD_GROUND_ITEM", onAddGroundItem)
    bind("REMOVE_GROUND_ITEM", onRemoveGroundItem)

    bind("INVENTORY", onInventory)

    bind("EQUIPMENT", onEquipment)
    bind("ATTRIB", onAttrib)

    bind("SWING_ITEM", onSwingItem)
    bind("POINT_ITEM", onPointItem)
    bind("CANCEL_POINT", onCancelPointItem)
    bind("PROJECTILE", onProjectile)

    bind("HIT_SPLAT", onHitSplat)
    bind("PROGRESS_INDICATOR", onProgressIndicator)
    bind("CHAT_BUBBLE", onChatBubble)
    bind("HEALTH_BAR", onHealthBar)

    bind("HEALTH", onHealth)
    bind("LEVEL", onLevel)

    bind("LOAD_MAP", onLoadMap)
    bind("SET_OBJECT", onSetObject)

    bind("DIALOGUE", onOpenDialogue)
    bind("BANK", onBank)
    bind("OPEN_TRADE", onOpenTrade)
    bind("UPDATE_TRADE", onUpdateTrade)
    bind("SHOP", onOpenShop)
    bind("SELECT_BUY", onSelectBuy)
    bind("SELECT_SELL", onSelectSell)
    bind("CRAFTING", onOpenCrafting)
    bind("CLOSE_WINDOW", onCloseWindow)

    bind("DYNAMIC_WEATHER", (game, enabled: boolean) =>
        game.engine.weatherHandler.setEffect(game.engine, enabled ? "rain" : "none"))

    bind("BRIGHTNESS", (game, brightness: number) =>
        game.engine.lightHandler.brightness = brightness)

    bind("MESSAGE", (game, message: string[]) =>
        game.chat.addMessage(message))
}