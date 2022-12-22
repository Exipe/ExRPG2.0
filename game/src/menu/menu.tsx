
import React = require("react");
import { Link, useNavigate } from "react-router-dom";
import { FormContainer } from "./form";
import { MenuProvider, useMenu } from "./menu-provider";
import { UpdateContainer } from "./updates";
import "./menu.scss"
import { useConnection } from "../connection/connection-provider";

const BACKGROUND = "menu_bg.png"

const VERSION_MAJOR = 0
const VERSION_MINOR = 0

function LogoContainer(_: any) {
    return <div id="logoContainer">
        <img id="logo" src="ui/logo.png" />
        <p>(Alpha 1.{VERSION_MAJOR}.{VERSION_MINOR})</p>
    </div>
}



export function MenuContainer() {
    const { errorMessage, setErrorMessage } = useMenu();
    const { connection, serverStatus, connect } = useConnection();
    const navigate = useNavigate();

    const [online, setOnline] = React.useState(false)

    React.useEffect(() => {
        switch(serverStatus) {
            case "Offline":
                setOnline(false)
                if(online) {
                    setErrorMessage("Lost connection to server")
                }
                break
            case "Online":
                setOnline(true)
                setErrorMessage("")
                break
        }
    }, [serverStatus])

    React.useEffect(
        () => connect(), 
        [])

    React.useEffect(() => {
        if(connection == null) {
            return
        }

        connection.on("CONNECT_RESPONSE", ({message, accepted}) => {
            if(message != undefined) {
                setErrorMessage(message)
            }

            if(accepted) {
                navigate("play")
            }
        })

        return () => { connection.off("CONNECT_RESPONSE") }
    }, [connection])

    let displayForm = <></>
    if(serverStatus == 'Online') {
        displayForm = <FormContainer />
    } else if(serverStatus == 'Offline') {
        displayForm = <a className="link"
            onClick={() => connect() }>Refresh</a>
    }

    return <div id="menuContainer">
        <p>Server status: {serverStatus}</p>

        {displayForm}

        <p id="error">{errorMessage}</p>

        <div id="links">
            <a className="link" href="#">Discord</a>
        </div>
    </div>
}

export function Menu() {
    React.useEffect(() => {
        const body = document.querySelector("body")
        body.style.backgroundImage = `url('${BACKGROUND}')`

        return () => { body.style.backgroundImage = "" }
    }, [])

    return <MenuProvider>
        <div>
            <div id="header"></div>
            <div id="footer"><p>© Ludwig Johansson</p></div>
            <div id="menu">
                <LogoContainer />
                <MenuContainer />
                <UpdateContainer />
            </div>
        </div>
    </MenuProvider>
}