import { Component } from "../entity/component";
import { StaticAnimation } from "./static-animation";

export class StaticAnimationComponent extends Component {

    private readonly animation: StaticAnimation;

    constructor(animation: StaticAnimation) {
        super("STATIC_ANIMATION");
        this.animation = animation;
    }

    public animate(dt: number) {
        this.animation.animate(dt);
    }

    public draw(x: number, y: number) {
        this.animation.sprite.draw(x, y);
    }

}