import { Sprite, PlayerSprite, ObjectEntity, Engine, Item } from "exrpg"
import { Connection } from "../connection/connection"
import { bindIncomingPackets } from "../connection/incoming-packet"
import { PlayerActionPacket, NpcActionPacket, ObjectActionPacket, TakeItemPacket } from "../connection/packet"
import { Npc, NpcInfo } from "./character/npc"
import { Player, PlayerInfo } from "./character/player"
import { Game } from "./game"
import { GroundItem } from "./ground-item"
import { Goal } from "./path-finder/path-finder-types"
import { PathFinderWorker } from "./path-finder/path-finder-worker"

async function initPlayers(game: Game) {
    const connection = game.connection
    const engine = game.engine

    const baseSprite = 
        await engine.loadTexture("char/man.png")
        .then(texture => 
            new Sprite(engine, texture))

    const onContext = (player: Player) => {
        if(player.id == game.localId) {
            return
        }

        const goal: Goal = {
            x: player.tileX,
            y: player.tileY,
            width: 1,
            height: 1,
            distance: 1
        }

        const addCtx = (option: string, action: string) => {
            const text = `${option} /rgb(230,180,255,${player.name})`
            game.ctxMenu.add([text, () => {
                game.walkToGoal(goal).then(() => {
                    connection.send(new PlayerActionPacket(player.id, action))
                })
            }])
        }

        addCtx("Attack", "attack")
        addCtx("Trade", "trade")
        addCtx("Follow", "follow")
    }

    const getAppearanceValues = (equipment: string[]) => {
        const appearanceValues = []
        equipment.forEach(id => {
            const equipData = engine.itemHandler.get(id).equipData
            if(equipData.drawable) {
                appearanceValues.push(equipData.sprite)
            }
        })
        return appearanceValues
    }

    game.createPlayer = (equipment: string[], info: PlayerInfo) => {
        const sprite = new PlayerSprite(engine, baseSprite, 
            getAppearanceValues(equipment));
        return new Player(game, sprite, onContext, info);
    };
    
    game.updatePlayerAppearance = (id: number, equipment: string[]) => {
        const playerSprite = game.getPlayer(id).sprite;
        playerSprite.setAppearanceValues(
            getAppearanceValues(equipment));
    };
}

function initNpcs(game: Game): void {
    const connection = game.connection

    const npcAction = (npc: Npc, action: string) => {
        const goal: Goal = {
            x: npc.tileX,
            y: npc.tileY,
            width: 1,
            height: 1,
            distance: 1
        }

        game.walkToGoal(goal).then(() => {
            if(action != null) {
                connection.send(new NpcActionPacket(npc.id, action))
            }
        })
    }

    const onNpcContext = (npc: Npc) => {
        const data = npc.data
        data.options.forEach(option => {
            const text = `${option[0]} /rgb(255,230,120,${data.name})`
            game.ctxMenu.add([text, () => {
                npcAction(npc, option[1])
            }])
        })
    }

    const onNpcClick = (npc: Npc) => {
        const action = npc.data.options.length > 0 ? npc.data.options[0][1] : null
        npcAction(npc, action)
    }

    game.createNpc = (info: NpcInfo) => {
        const npc = new Npc(game, info,
            onNpcContext,
            onNpcClick,);
        return npc;
    };
}

function initObjects(game: Game) {
    const engine = game.engine

    let clickObject = (obj: ObjectEntity, action: string) => {
        const data = obj.data
        const goal: Goal = {
            x: obj.tileX,
            y: obj.tileY,
            width: data.width,
            height: data.depth,
            distance: 1
        }

        game.walkToGoal(goal).then(() => {
            if(action != null) {
                game.connection.send(new ObjectActionPacket(data.id, action, obj.tileX, obj.tileY))
            }
        })
    }

    engine.inputHandler.onObjectContext = obj => {
        const data = obj.data
        data.options.forEach(option => {
            const text = `${option[0]} /rgb(150,230,120,${data.name})`
            game.ctxMenu.add([text, () => {
                clickObject(obj, option[1])
            }])
        })
    }

    engine.inputHandler.onObjectClick = obj => {
        const action = obj.data.options.length > 0 ? obj.data.options[0][1] : null
        clickObject(obj, action)
    }
}

function initGroundItems(game: Game): void {
    const engine = game.engine

    const takeItem = (item: Item) => {
        if(!(item instanceof GroundItem)) {
            return
        }

        game.walkTo(item.x, item.y).then(() => {
            game.connection.send(new TakeItemPacket(item.id))
        })
    }

    engine.inputHandler.onItemContext = item => {
        const text = `Take /rgb(155,255,255,${item.data.name})`
        game.ctxMenu.add([text, () => {
            takeItem(item)
        }])
    }

    engine.inputHandler.onItemClick = takeItem
}

export async function initGame(engine: Engine, connection: Connection) {
    const pathFinderWorker = new PathFinderWorker() // start path finder thread
    const game = new Game(engine, connection, 
        pathFinderWorker);

    (window as any).hideLocal = () => {
        game.getLocal().destroy()
    }

    await initPlayers(game)
    initNpcs(game)
    initObjects(game)
    initGroundItems(game)

    bindIncomingPackets(game)

    engine.inputHandler.onTileClick = (x, y, _) => {
        game.walkTo(x, y)
    }

    engine.inputHandler.onTileContext = (x, y) => {
        game.ctxMenu.add(["Walk here", () => { 
            game.walkTo(x, y) 
        }])
    }

    engine.inputHandler.onContext = (x, y) => {
        game.ctxMenu.open(x, y)
    }

    engine.onAnimate = () => {
        game.update()
    }

    return game
}