
import { Connection } from "../../connection/connection";
import { SayPacket, CommandPacket } from "../../connection/packet";
import { Observable } from "../../util/observable";

const COMMAND_PREFIX = "/"

export class ChatModel {

    private readonly connection: Connection

    private _messages = new Observable<string[][]>([])

    constructor(connection: Connection) {
        this.connection = connection
    }


    public get messages() {
        return this._messages
    }

    public addMessage(message: string | string[]) {
        if(typeof message == "string") {
            message = [ message ]
        }

        this._messages.value = [ message ].concat(this._messages.value)
    }

    public sendMessage(message: string) {
        let packet = message.startsWith(COMMAND_PREFIX) ?
            new CommandPacket(message.substr(1)) :
            new SayPacket(message)

        this.connection.send(packet)
    }

}