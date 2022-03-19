
import WebSocket from "ws";
import { Packet } from "./outgoing-packet";
import { Player } from "../player/player";

type Callback = (data: any) => any

export type ConnectionState = "initial" | "connected" | "playing"

export class Connection {

    private readonly socket: WebSocket

    public state = "initial" as ConnectionState
    public player: Player = null

    public readonly ip: string

    constructor(socket: WebSocket, ip: string) {
        this.socket = socket
        this.ip = ip
    }

    public send(packet: Packet) {
        this.socket.send(JSON.stringify({
            id: packet.id,
            data: packet.data
        }))
    }

    public close() {
        this.socket.close()
    }

    public onClose(callback: () => any) {
        this.socket.on('close', callback)
    }

}