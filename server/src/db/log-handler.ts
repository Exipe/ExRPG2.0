import { Db } from "mongodb";
import { Connection } from "../connection/connection";

export const ERROR_COLLECTION = "errors"

export class LogHandler {

    private readonly db: Db

    private get errors() { return this.db.collection(ERROR_COLLECTION) }

    constructor(db: Db) {
        this.db = db
    }

    public error(connection: Connection, message: string) {
        const data = {
            ip: connection.ip,
            state: connection.state,
            player: connection.player != null ? 
                connection.player.name : undefined,
            message: message
        }

        this.errors.insertOne(data)
    }

}