
import React = require("react");
import { StateId } from "..";
import { initConnection, Connection } from "../connection/connection";
import { FormContainer } from "./form";
import { UpdateContainer } from "./updates";

declare var __PROTOCOL__: string;
declare var __ADDRESS__: string;
declare var __PORT__: number;

export interface MenuProps {
    setState: (state: StateId) => void
}

const BACKGROUND = "menu_bg.png"

const VERSION_MAJOR = 0
const VERSION_MINOR = 0

type ServerStatus = "Connecting" | "Online" | "Offline"

function LogoContainer(_: any) {
    return <div id="logoContainer">
        <img id="logo" src="ui/logo.png" />
        <p>(Alpha 1.{VERSION_MAJOR}.{VERSION_MINOR})</p>
    </div>
}



export function MenuContainer(props: MenuProps) {
    const [connection, setConnection] = React.useState(null as Connection)
    const [serverStatus, setServerStatus] = React.useState("Connecting" as ServerStatus)
    const [errorMessage, setErrorMessage] = React.useState("")

    React.useEffect(() => {
        if(connection == null) {
            return
        }

        connection.onOpen(() => {
            setServerStatus("Online")
            setErrorMessage("")
        })

        connection.onClose(() => {
            if(serverStatus == "Online") {
                setErrorMessage("Lost connection to server")
            } else if(serverStatus == "Connecting") {
                setErrorMessage("")
            }

            setServerStatus("Offline")
        })

        return () => {
            connection.onOpen(null)
            connection.onClose(null)
        }
    }, [connection, serverStatus])

    React.useEffect(() => {
        const connection = initConnection(__PROTOCOL__, __ADDRESS__, __PORT__)
        setConnection(connection)

        connection.on("CONNECT_RESPONSE", data => {
            if(data.message != undefined) {
                setErrorMessage(data.message)
            }

            if(data.accepted) {
                props.setState("main")
            }
        })

        return () => { connection.off("CONNECT_RESPONSE") }
    }, [])

    let displayForm = <></>
    if(serverStatus == 'Online') {
        displayForm = <FormContainer connection={connection} 
            setErrorMessage={setErrorMessage} />
    } else if(serverStatus == 'Offline') {
        displayForm = <a href="" className="link">Refresh</a>
    }

    return <div id="menuContainer">
        <p>Server status: {serverStatus}</p>

        {displayForm}

        <p id="error">{errorMessage}</p>

        <div id="links">
            <a className="link" target="_blank" href="https://github.com/ludwigdev/ExRPG">GitHub</a>
            <a className="link" target="_blank" href="https://discord.gg/ZTEeuvYXDv">Discord</a>
        </div>
    </div>
}

export function Menu(props: MenuProps) {
    React.useEffect(() => {
        const body = document.querySelector("body")
        body.style.backgroundImage = `url('${BACKGROUND}')`

        return () => { body.style.backgroundImage = "" }
    }, [])

    return <div>
    <div id="header"></div>
    <div id="footer"><p>© Ludwig Johansson</p></div>
    <div id="menu">
        <LogoContainer />
        {MenuContainer(props)}
        <UpdateContainer />
    </div>
    </div>
}