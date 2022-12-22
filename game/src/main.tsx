
import { Game } from "./game/game";
import React = require("react");
import { initEngine, Engine } from "exrpg";
import { UiContainer } from "./ui/ui";
import { ReadyPacket } from "./connection/packet";
import { initGame } from "./game/init-game";
import { useConnection } from "./connection/connection-provider";
import { useNavigate } from "react-router-dom";

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
    const { connection } = useConnection();
    const navigate = useNavigate();

    React.useEffect(() => {
        if(connection == null) {
            navigate("/", { replace: true })
            return
        }

        let setup = async () => {
            const engine = await setupEngine(canvas.current);
            setGame(await initGame(engine, connection))

            connection.send(new ReadyPacket())
        }

        setup()
    }, [connection])

    React.useEffect(() => {
        const disableContextMenu = (e: MouseEvent) => {
            e.preventDefault()
        }

        document.addEventListener("contextmenu", disableContextMenu)

        return () => {
            document.removeEventListener("contextmenu", disableContextMenu)
        }
    }, [])

    React.useEffect(
        () => () => connection?.close(), 
        [])

    return <>
        <canvas ref={canvas}></canvas>

        {game != null &&
            <UiContainer  game={game} />
        }
    </>
}