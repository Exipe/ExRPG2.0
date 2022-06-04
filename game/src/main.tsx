
import { Game } from "./game/game";
import React = require("react");
import { connection } from "./connection/connection";
import { initEngine, Engine } from "exrpg";
import { UiContainer } from "./ui/ui";
import { ReadyPacket } from "./connection/packet";
import { initGame } from "./game/init-game";

function windowResize(canvas: HTMLCanvasElement, engine: Engine) {
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
    engine.resize(canvas.width, canvas.height)
}

async function setupEngine(canvas: HTMLCanvasElement) {
    const engine = await initEngine(canvas, "res").catch((e) => {
        alert(e)
        return null
    })

    window.onresize = () => windowResize(canvas, engine)
    windowResize(canvas, engine)
    return engine
}

export function Main(_: any) {
    const [game, setGame] = React.useState(null as Game)
    const canvas = React.useRef(null as HTMLCanvasElement)

    React.useEffect(() => {
        let setup = async () => {
            const engine = await setupEngine(canvas.current);
            setGame(await initGame(engine, connection))

            connection.send(new ReadyPacket())
        }

        setup()
    }, [])

    React.useEffect(() => {
        const disableContextMenu = (e: MouseEvent) => {
            e.preventDefault()
        }

        document.addEventListener("contextmenu", disableContextMenu)

        return () => {
            document.removeEventListener("contextmenu", disableContextMenu)
        }
    }, [])

    return <>
        <canvas ref={canvas}></canvas>

        {game != null &&
            <UiContainer  game={game} />
        }
    </>
}