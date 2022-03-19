
import { Player } from "./player"
import { Packet, ConnectResponse, MessagePacket } from "../connection/outgoing-packet"
import { Connection } from "../connection/connection"
import { saveProgress } from "./progress/save-progress"
import { Progress } from "./progress/progress"
import { db } from "../db/db"

export class PlayerHandler {

    private idCount = 0
    private players: Player[] = []

    public broadcast(packet: Packet) {
        this.players.forEach(player => {
            player.send(packet)
        })
    }

    public globalMessage(...message: string[]) {
        this.broadcast(new MessagePacket(message))
    }

    public get(id: number) {
        return this.players.find(p => p.id == id)
    }

    public getName(name: string) {
        return this.players.find(p => p.name.toLowerCase() == name.toLowerCase())
    }

    public get count() {
        return this.players.length
    }

    public remove(removePlayer: Player) {
        if(removePlayer.connectionState == "playing") {
            const progress = saveProgress(removePlayer)
            db.users.save(removePlayer.persistentId, progress)
        }

        this.players = this.players.filter(player => player != removePlayer)
    }

    private preparePlayer(connection: Connection, persistentId: string, name: string, progress = null as Progress) {
        if(this.getName(name) != null) {
            connection.send(new ConnectResponse(false, "User is already signed in."))
            return
        }

        const id = this.idCount++
        const player = new Player(connection, persistentId, id, name, progress)
        this.players.push(player)

        connection.state = "connected"
        connection.send(new ConnectResponse(true))
    }

    public async register(username: string, password: string, connection: Connection) {
        const status = await db.users.register(username, password)
        const [success, error] = status
        if(!success) {
            connection.send(new ConnectResponse(false, error))
            return
        }

        setImmediate(() => { // synchronize last step, just in case two players log in at the same
            this.preparePlayer(connection, username.toLowerCase(), username)
        })
    }

    public async login(username: string, password: string, connection: Connection) {
        const [success, user, error] = await db.users.authenticate(username, connection.ip, password)
        if(!success) {
            connection.send(new ConnectResponse(false, error))
            return
        }

        setImmediate(() => { // synchronize last step, just in case two players log in at the same
            this.preparePlayer(connection, user.persistentId, user.name, user.progress)
        })
    }

}
