import { Entity, Sprite } from "exrpg";
import { Game } from "../game";
import { ChatBubbleComponent } from "./component/chat-bubble";
import { HealthBarComponent } from "./component/health-bar";
import { ProgressIndicatorComponent } from "./component/progress-indicator";
import { Walking } from "./walking";
import { TileOverlayComponent } from "./component/tile-overlay";

export abstract class Character extends Entity {
    private walking: Walking = null

    public healthBarComponent: HealthBarComponent
    public progressIndicatorComponent: ProgressIndicatorComponent

    constructor(protected readonly game: Game, tileX: number, tileY: number, width = 0, height = 0, tileSpan = 1) {
        super(tileX, tileY, width, height, tileSpan)
        this.healthBarComponent = new HealthBarComponent(this, game.overlayArea)
        this.progressIndicatorComponent = new ProgressIndicatorComponent(this,
            game.engine.itemHandler, game.overlayArea)

        this.componentHandler.add(this.healthBarComponent);
        this.componentHandler.add(this.progressIndicatorComponent);
        this.componentHandler.add(new ChatBubbleComponent(this, game.overlayArea));
        this.componentHandler.add(new TileOverlayComponent(this, game.overlayArea));
    }

    public abstract getDepth(): number;

    public abstract getSprite(): Sprite

    public animate(dt: number) {
        super.animate(dt)

        if (this.walking != null && this.walking.animate(dt)) {
            this.walking = null
        }
    }

    public walkTo(x: number, y: number, animationSpeed: number) {
        this.tileX = x;
        this.tileY = y;
        this.componentHandler.forEach(c => c.moveTile());
        this.walking = new Walking(this, x, y, animationSpeed);
    }

    public place(x: number, y: number) {
        this.walking = null
        this.moveTile(x, y)
    }

}