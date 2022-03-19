
import { Sprite } from ".."
import { ShaderHandler } from "../shader/shader-handler"
import { Component } from "./component"

export const OUTLINE_COMPONENT = "OUTLINE"

type Color = [number, number, number, number]

export class OutlineComponent extends Component {

    private readonly sprite: Sprite
    private readonly shaderHandler: ShaderHandler

    private hover: boolean

    private color: Color

    constructor(sprite: Sprite, shaderHandler: ShaderHandler, color: Color = [1, 1, 1, 1]) {
        super(OUTLINE_COMPONENT)
        this.sprite = sprite
        this.shaderHandler = shaderHandler
        this.color = color
    }

    postDraw(x: number, y: number) {
        if(!this.hover) {
            return
        }

        const shader = this.shaderHandler.useOutlineShader()
        shader.setColor(this.color)

        this.sprite.draw(x, y, shader)
    }

    startHover() {
        this.hover = true
    }

    stopHover() {
        this.hover = false
    }

}