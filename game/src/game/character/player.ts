
import { LightComponent, OutlineComponent, PlayerSprite, Sprite } from "exrpg"
import { Game } from "../game"
import { Character } from "./character"
import { NameTagComponent } from "./component/name-tag"

export type PlayerRank = "player" | "dev"

export interface PlayerInfo {
    id: number,
    name: string,
    x: number,
    y: number,
    rank: PlayerRank,
    tempSprite?: string
}

export class Player extends Character {

    public readonly id: number
    public readonly name: string
    public readonly playerSprite: PlayerSprite

    public readonly rank: PlayerRank

    private _onContext: (player: Player) => void

    private tempSpritePath?: string;
    private tempSprite?: Sprite;

    constructor(game: Game, playerSprite: PlayerSprite, onContext: (player: Player) => void, info: PlayerInfo) {
        super(game, info.x, info.y, playerSprite.width, playerSprite.height)
        this.componentHandler.add(
            new NameTagComponent(this, game.overlayArea, info.rank, info.name)
        )
        this.componentHandler.add(new LightComponent(this, game.engine.lightHandler, { radius: 48, offsetX: 0, offsetY: 0 }))
        if (info.id != game.localId) {
            this.componentHandler.add(new OutlineComponent(playerSprite.sprite, game.engine.shaderHandler))
        }
        this.id = info.id
        this.name = info.name
        this.playerSprite = playerSprite
        this._onContext = onContext

        if(info.tempSprite !== undefined) {
            this.setTempSprite(info.tempSprite);
        }
    }

    public async setTempSprite(path: string) {
        this.tempSpritePath = path;

        const texture = await this.game.engine.loadTexture(path);
        if(this.tempSpritePath !== path) {
            return;
        }

        this.tempSprite = new Sprite(this.game.engine, texture);
        this.setDimensions(this.tempSprite.width, this.tempSprite.height);
    }

    public unsetTempSprite() {
        this.tempSprite = undefined;
    }

    public getSprite() {
        return this.tempSprite !== undefined
            ? this.tempSprite
            : this.playerSprite.sprite
    }

    public getDepth() {
        return 1;
    }

    protected onContext(_: any) {
        this._onContext(this)
    }

    public draw() {
        super.draw()

        if(this.tempSprite !== undefined) {
            this.tempSprite.draw(this.drawX, this.drawY);
            return;
        }

        this.playerSprite.draw(this.drawX, this.drawY)
    }

}
