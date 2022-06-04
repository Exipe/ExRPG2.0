
import { EntityShadow, NpcData, OutlineComponent, Sprite } from "exrpg";
import { Game } from "../game";
import { Character } from "./character";
import { NameTagComponent } from "./component/name-tag";

function combatLevel(npcData: NpcData) {
    const cb = npcData.raw.combat

    if(!cb) {
        return -1
    }

    const attribs = [cb.accuracy, cb.defence, cb.damage, cb.attackSpeed]
    return 1 + Math.ceil(
        attribs.reduce((previous, current) => 
            previous + (current ? current : 0))
        / attribs.length)
}

export interface NpcInfo {
    id: number,
    dataId: string,
    x: number,
    y: number
}

type Listener = (npc: Npc) => void;

export class Npc extends Character {
    
    public readonly id: number

    public readonly data: NpcData
    
    private sprite: Sprite = null

    public readonly contextListener: Listener
    public readonly clickListener: Listener

    constructor(game: Game, info: NpcInfo, contextListener: Listener, clickListener: Listener) {
        super(game, info.x, info.y)
        this.contextListener = contextListener;
        this.clickListener = clickListener;
        this.id = info.id

        this.data = game.engine.npcHandler.get(info.dataId)
        const cbLevel = combatLevel(this.data)
        const nameTag = (cbLevel > 0 ? `[${cbLevel}] ` : '')
            + this.data.name

        this.componentHandler.add(
            new NameTagComponent(this, game.overlayArea, "npc", nameTag)
        )

        this.data.getSprite(game.engine)
        .then(sprite => {
            this.sprite = sprite
            this.setDimensions(sprite.width, sprite.height)

            const color: any = this.data.options.length > 0 
                        && this.data.options[0][1] == "__attack" 
                        ? [1, 0.25, 0.25, 1] : [1, 1, 1, 1]
                
            this.componentHandler.add(new OutlineComponent(this.sprite, game.engine.shaderHandler, color))

            if(this.data.shadowData != null) {
                this.shadow = new EntityShadow(this, sprite, this.data.shadowData)
            }
        })
    }

    public get interactable() {
        return this.data.options.length > 0
    }

    public getSprite() {
        return this.sprite
    }

    protected onContext(_: any) {
        if(this.contextListener == null) {
            return
        }

        this.contextListener(this)
    }

    protected onClick(_: any) {
        if(this.clickListener == null) {
            return false
        }

        this.clickListener(this)
        return true
    }

    public draw() {
        super.draw()

        if(this.sprite == null) {
            return
        }

        this.sprite.draw(this.drawX, this.drawY)
    }

}
