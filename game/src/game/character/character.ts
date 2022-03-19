import { Entity, Sprite } from "exrpg";
import { Game } from "../game";
import { ChatBubbleComponent } from "./component/chat-bubble";
import { HealthBarComponent } from "./component/health-bar";
import { NameTagComponent } from "./component/name-tag";
import { ProgressIndicatorComponent } from "./component/progress-indicator";
import { Walking } from "./walking";

export abstract class Character extends Entity {

    private game: Game

    private walking: Walking = null

    public healthBarComponent: HealthBarComponent
    public progressIndicatorComponent: ProgressIndicatorComponent

    constructor(game: Game, tileX: number, tileY: number, width = 0, height = 0) {
        super(tileX, tileY, width, height)
        this.game = game
        this.healthBarComponent = new HealthBarComponent(this, game.overlayArea)
        this.progressIndicatorComponent = new ProgressIndicatorComponent(this, 
            game.engine.itemHandler, game.overlayArea)

        this.componentHandler.add(this.healthBarComponent)
        this.componentHandler.add(this.progressIndicatorComponent)
        this.componentHandler.add(new ChatBubbleComponent(this, game.overlayArea))
    }

    public abstract getSprite(): Sprite

    public animate(dt: number) {
        super.animate(dt)

        if(this.walking != null && this.walking.animate(dt)) {
            this.walking = null
        }
    }

    public walkTo(x: number, y: number, animationSpeed: number) {
        this.tileX = x
        this.tileY = y
        this.walking = new Walking(this, x, y, animationSpeed)
    }

    public place(x: number, y: number) {
        this.walking = null
        this.moveTile(x, y)
    }

}