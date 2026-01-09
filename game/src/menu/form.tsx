import React = require("react")
import { Route, Routes, useNavigate } from "react-router-dom"
import { useConnection } from "../connection/connection-provider"
import { LoginPacket, RegisterPacket } from "../connection/packet"
import { useMenu } from "./menu-provider"

const MainState: React.FC<{}> = () => {
    const navigate = useNavigate()

    return <>
        <div className="menu-button"
            onClick={ () => navigate("register") }>New user</div>
        <div className="menu-button"
            onClick={ () => navigate("login") }>Existing user</div>
    </>
}

const LoginState: React.FC<{}> = () => {
    const [username, setUsername] = React.useState("")
    const [password, setPassword] = React.useState("")
    const userRef = React.useRef(null as HTMLInputElement)
    const passRef = React.useRef(null as HTMLInputElement)
    const navigate = useNavigate()

    const { setErrorMessage } = useMenu();
    const { connection } = useConnection();

    React.useEffect(() => {
        userRef.current.focus()
    }, [])

    const login = () => {
        if(username == "") {
            setErrorMessage("Please provide a username.")
        }
        else if(password == "") {
            setErrorMessage("Please provide a password.")
        } else {
            setErrorMessage("")
            connection.send(new LoginPacket(username, password))
        }
    }

    return <>
        <input ref={userRef} 
            className="menu-input" 
            placeholder="Username"
            value={username} 
            onChange={ e => setUsername(e.target.value) } 
            onKeyDown={(e) => { if(e.key == "Enter" && username.length > 0) passRef.current.focus() }} />
        <input ref={passRef} 
            className="menu-input" 
            type="password" 
            placeholder="Password" 
            autoComplete="off" 
            value={password} onChange={ e => setPassword(e.target.value) }
            onKeyDown={(e) => { if(e.key == "Enter" && password.length > 0) login() }} />

        <div className="menu-row">
            <div className="menu-button"
                onClick={login}>Continue</div>
            <div className="menu-button"
                onClick={ () => navigate(-1) }>Cancel</div>
        </div>
    </>
}

const RegisterState: React.FC<{}> = () => {
    const [username, setUsername] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [repeatPassword, setRepeatPassword] = React.useState("")
    const navigate = useNavigate()

    const { setErrorMessage } = useMenu();
    const { connection } = useConnection();

    const register = () => {
        if(username == "") {
            setErrorMessage("Please provide a username.")
        }
        else if(password == "") {
            setErrorMessage("Please provide a password.")
        }
        else if(repeatPassword == "") {
            setErrorMessage("Please repeat your password.")
        }
        else if(password != repeatPassword) {
            setErrorMessage("Passwords do not match.")
        }
        else {
            setErrorMessage("")
            connection.send(new RegisterPacket(username, password))
        }
    }

    return <>
        <input className="menu-input" 
            placeholder="Username"
            value={username} 
            onChange={ e => setUsername(e.target.value) } />
        <input className="menu-input" 
            type="password" 
            placeholder="Password" 
            autoComplete="off" 
            value={password} 
            onChange={ e => setPassword(e.target.value) } />
        <input className="menu-input" 
            type="password" 
            placeholder="Repeat password" 
            autoComplete="off"  
            value={repeatPassword} 
            onChange={ e => setRepeatPassword(e.target.value) } />

        <div className="menu-row">
            <div className="menu-button"
                onClick={register}>Register</div>
            <div className="menu-button"
                onClick={ () => navigate(-1) }>Cancel</div>
        </div>
    </>
}

export const FormContainer: React.FC<{}> = () => {
    return <form id="input-container">
        <Routes>
            <Route index
                element={<MainState />} />
            <Route 
                path="login"
                element={<LoginState />} />
            <Route
                path="register"
                element={<RegisterState />} />
        </Routes>
    </form>
}