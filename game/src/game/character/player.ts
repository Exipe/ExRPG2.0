
import { LightComponent, OutlineComponent, PlayerSprite } from "exrpg"
import { Game } from "../game"
import { Character } from "./character"
import { NameTagComponent } from "./component/name-tag"

export type PlayerRank = "player" | "dev"

export interface PlayerInfo {
    id: number,
    name: string,
    x: number,
    y: number,
    rank: PlayerRank
}

export class Player extends Character {

    public readonly id: number
    public readonly name: string
    public readonly sprite: PlayerSprite

    public readonly rank: PlayerRank

    private _onContext: (player: Player) => void

    constructor(game: Game, playerSprite: PlayerSprite, onContext: (player: Player) => void, info: PlayerInfo) {
        super(game, info.x, info.y, playerSprite.width, playerSprite.height)
        this.componentHandler.add(
            new NameTagComponent(this, game.overlayArea, info.rank, info.name)
        )
        this.componentHandler.add(new LightComponent(this, game.engine.lightHandler, 48))
        if(info.id != game.localId) {
            this.componentHandler.add(new OutlineComponent(playerSprite.sprite, game.engine.shaderHandler))
        }
        this.id = info.id
        this.name = info.name
        this.sprite = playerSprite
        this._onContext = onContext
    }

    public getSprite() {
        return this.sprite.sprite
    }

    protected onContext(_: any) {
        this._onContext(this)
    }

    public draw() {
        super.draw()
        this.sprite.draw(this.drawX, this.drawY)
    }

}
