import { Scene } from "./scene";
import { parseAttrib } from "./scene-handler";

export class SceneInstance extends Scene {

    constructor(prototype: Scene) {
        super(prototype.id, prototype.width, prototype.height)

        prototype.attribs.forEach(a => {
            parseAttrib(this, a)
        })
    }

}