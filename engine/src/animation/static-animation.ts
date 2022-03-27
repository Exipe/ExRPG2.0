import { Engine } from "../engine";
import { MultiTexture } from "../texture/multi-texture";
import { Sprite } from "../texture/sprite";

export const loadStaticAnimation = 
    async (engine: Engine, path: string, 
        frames: number, duration: number) => 
{
    const texture = await engine.loadTexture(`${path}.frames.png`);
    const multiTexture = new MultiTexture(texture, frames, 1, false);
    const sprites = multiTexture.getSprites(engine)[0];

    return new StaticAnimation(sprites, duration);
}

export type StaticAnimationData = {
    duration: number,
    frames: number
}

export class StaticAnimation {

    private readonly sprites: Sprite[];
    private readonly animationDuration: number;

    private iterator = 0;
    private timer = 0;

    constructor(sprites: Sprite[], animationDuration: number) {
        this.sprites = sprites;
        this.animationDuration = animationDuration;
    }

    public get sprite() {
        return this.sprites[this.iterator];
    }

    private get frameDuration() {
        return this.animationDuration / this.sprites.length;
    }

    public animate(dt: number) {
        this.timer += dt;

        const iterator = Math.floor(this.timer / this.frameDuration);
        this.iterator = iterator % this.sprites.length;
    }

}