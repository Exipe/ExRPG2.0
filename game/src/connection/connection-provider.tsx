import React = require("react");
import { Connection } from "./connection";

declare var __PROTOCOL__: string;
declare var __ADDRESS__: string;
declare var __PORT__: number;

type ServerStatus = "Connecting" | "Online" | "Offline"

export type IConnectionContext = {
    connection: Connection,
    connect: () => void,
    disconnect: () => void,
    serverStatus: ServerStatus,
};

const Context = React.createContext<IConnectionContext>(undefined);

export const ConnectionProvider: React.FC<{}> = ({
    children
}) =>  {
    const [serverStatus, setServerStatus] = React.useState("Connecting" as ServerStatus)
    const [connection, setConnection] = React.useState<Connection>(null)

    React.useEffect(() => {
        if(connection == null) {
            return
        }

        connection.onConnectionEstablished = () => {
            setServerStatus("Online")
        }

        connection.onConnectionLost = () => {
            setServerStatus("Offline")
        }

        return () => {
            connection.onConnectionEstablished = () => {}
            connection.onConnectionLost = () => {}
        }
    }, [connection, serverStatus])

    const connect = () => {
        if(connection) {
            connection.close()
        }

        setServerStatus("Connecting")
        setConnection(new Connection(__PROTOCOL__, __ADDRESS__, __PORT__))
    }

    const disconnect = () => {
        connection.close()
        setConnection(null)
    }

    const context: IConnectionContext = {
        connection,
        connect, disconnect,
        serverStatus
    };
    return <Context.Provider value={context}>
        {children}
    </Context.Provider>
}

export const useConnection = () => React.useContext(Context);