import React = require("react")
import { Connection } from "../connection/connection"
import { LoginPacket, RegisterPacket } from "../connection/packet"

type InputState = "main" | "register" | "login"

interface InputStateProps {
    setMenuState: (state: InputState) => void
    setErrorMessage: (error: string) => void
    connection: Connection
}

function MainState(properties: { props: InputStateProps }) {
    const props = properties.props

    return <>
        <div className="menuButton"
            onClick={ () => props.setMenuState("register") }>New user</div>
        <div className="menuButton"
            onClick={ () => props.setMenuState("login") }>Existing user</div>
    </>
}

function LoginState(properties: { props: InputStateProps }) {
    const props = properties.props
    const [username, setUsername] = React.useState("")
    const [password, setPassword] = React.useState("")
    const userRef = React.useRef(null as HTMLInputElement)
    const passRef = React.useRef(null as HTMLInputElement)

    React.useEffect(() => {
        userRef.current.focus()
    }, [])

    const login = () => {
        if(username == "") {
            props.setErrorMessage("Please provide a username.")
        }
        else if(password == "") {
            props.setErrorMessage("Please provide a password.")
        } else {
            props.setErrorMessage("")
            props.connection.send(new LoginPacket(username, password))
        }
    }

    return <>
        <input ref={userRef} className="menuInput" placeholder="Username"
            value={username} onChange={ e => setUsername(e.target.value) } 
            onKeyDown={(e) => { if(e.key == "Enter" && username.length > 0) passRef.current.focus() }} />
        <input ref={passRef} className="menuInput" type="password" placeholder="Password" autoComplete="off" 
            value={password} onChange={ e => setPassword(e.target.value) }
            onKeyDown={(e) => { if(e.key == "Enter" && password.length > 0) login() }} />

        <div className="menuRow">
            <div className="menuButton"
                onClick={login}>Continue</div>
            <div className="menuButton"
                onClick={ () => props.setMenuState("main") }>Cancel</div>
        </div>
    </>
}

function RegisterState(properties: { props: InputStateProps }) {
    const props = properties.props
    const [username, setUsername] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [repeatPassword, setRepeatPassword] = React.useState("")

    const register = () => {
        if(username == "") {
            props.setErrorMessage("Please provide a username.")
        }
        else if(password == "") {
            props.setErrorMessage("Please provide a password.")
        }
        else if(repeatPassword == "") {
            props.setErrorMessage("Please repeat your password.")
        }
        else if(password != repeatPassword) {
            props.setErrorMessage("Passwords do not match.")
        }
        else {
            props.setErrorMessage("")
            props.connection.send(new RegisterPacket(username, password))
        }
    }

    return <>
        <input className="menuInput" placeholder="Username"
            value={username} onChange={ e => setUsername(e.target.value) } />
        <input className="menuInput" type="password" placeholder="Password" autoComplete="off" 
            value={password} onChange={ e => setPassword(e.target.value) } />
        <input className="menuInput" type="password" placeholder="Repeat password" autoComplete="off"  
            value={repeatPassword} onChange={ e => setRepeatPassword(e.target.value) } />

        <div className="menuRow">
            <div className="menuButton"
                onClick={register}>Register</div>
            <div className="menuButton"
                onClick={ () => props.setMenuState("main") }>Cancel</div>
        </div>
    </>
}

export interface FormContainerProps {
    connection: Connection
    setErrorMessage: (error: string) => void
}

export function FormContainer(props: FormContainerProps) {
    const [state, setState] = React.useState("main" as InputState)

    const inputStateProps: InputStateProps = {
        setMenuState: setState,
        setErrorMessage: props.setErrorMessage,
        connection: props.connection
    }

    let displayState = <></>
    switch(state) {
        case "main":
            displayState = <MainState props={inputStateProps} />
            break
        case "login":
            displayState = <LoginState props={inputStateProps} />
            break
        case "register":
            displayState = <RegisterState props={inputStateProps} />
            break
    }

    return <form id="inputContainer">
        {displayState}
    </form>
}