
import WebSocket from "ws"
import { db } from "../db/db"
import { red } from "../util/color"
import { Connection, ConnectionState } from "./connection"

type PacketCallback = (connection: Connection, data: any) => any
type PacketEntry = [ConnectionState, PacketCallback]


export class ConnectionHandler {

    private serverSocket: WebSocket.Server

    private readonly packets = new Map<String, PacketEntry>()

    constructor(options: WebSocket.ServerOptions) {
        this.serverSocket = new WebSocket.Server(options)
        this.serverSocket.on("connection", (ws, req) => {
            const ip = req.socket.remoteAddress
            this.handleConnection(ws, ip)
        })
    }

    public on(id: string, callback: PacketCallback, state = "playing" as ConnectionState) {
        this.packets.set(id, [state, callback])
    }

    private handleException(connection: Connection, msg: any, e: any) {
        db.logs.error(connection, 
            `Error occured when handling packet: ${msg.id}
            Message data: ${JSON.stringify(msg.data)}
            Stack: ${e.stack}`)

        if(connection.player != null) {
            connection.player.sendNotification("An internal server error occured.", red)
            connection.player.sendNotification("Our administrators have taken note of this error. Sorry for the inconvenience.", red)
        }
    }

    private handleMessage(connection: Connection, e: WebSocket.Data) {
        let msg: any
        try {
            msg = JSON.parse(e.toString())
        } catch(ex) {
            console.log("Error parsing packet JSON: " + e.toString())
            return
        }

        if(msg.id === undefined || msg.data === undefined || !this.packets.has(msg.id)) {
            console.log("Invalid packet: ", msg.id, ", ", msg.data)
            return
        }

        const packet = this.packets.get(msg.id)
        if(packet[0] != connection.state) {
            console.log(`Connection's state (${connection.state}) does not match packet state: ${packet[0]}`)
            return
        }

        try {
            packet[1](connection, msg.data)
        } catch(e) {
            this.handleException(connection, msg, e)
        }
    }

    private handleConnection(ws: WebSocket, ip: string) {
        const connection = new Connection(ws, ip)
        ws.on("message", (data) => {
            this.handleMessage(connection, data)
        })
        ws.on("close", () => {
            if(connection.player != null) {
                connection.player.remove()
            }
        })
    }

}