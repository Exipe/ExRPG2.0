
import { Packet } from "./packet"

export type Callback = (data: any) => any

export class Connection {

    private socket: WebSocket

    private readonly callbacks = new Map<String, Callback>()

    constructor(protocol: string, address: string, port: number) {
        this.socket = new WebSocket(protocol + "://" + address + ":" + port)
        this.socket.onmessage = e => {
            this.handleMessage(e)
        }
    }

    public close() {
        this.socket.onclose = undefined
        this.socket.close()
    }

    public set onConnectionEstablished(callback: () => void) {
        this.socket.onopen = _ => {
            callback()
        }
    }

    public set onConnectionLost(callback: () => void) {
        this.socket.onclose = _ => {
            if(callback != null) {
                callback()
            }
        }
    }

    public send(packet: Packet) {
        this.socket.send(JSON.stringify({
            id: packet.id,
            data: packet.data
        }))
    }

    public on(id: string, callback: Callback) {
        this.callbacks.set(id, callback)
    }

    public off(id: string) {
        this.callbacks.delete(id)
    }

    private handleMessage(e: MessageEvent) {
        const msg = JSON.parse(e.data)
        if(!this.callbacks.has(msg.id)) {
            throw "Unhandled packet: " + msg.id
        }

        const callback = this.callbacks.get(msg.id)
        callback(msg.data)
    }

}