import { Db, MongoClient } from "mongodb";
import { LogHandler } from "./log-handler";
import { ID_INDEX, IP_INDEX, LOGIN_LIMIT_COLLECTION, NAME_INDEX, UserHandler, USER_COLLECTION } from "./user-handler";

export let db: DbHandler

export async function initDb(url: string) {
    const client = new MongoClient(url)

    await client.connect()
    const clientDb = client.db()

    const users = clientDb.collection(USER_COLLECTION)
    await users.createIndex(ID_INDEX)
    await users.createIndex(NAME_INDEX)

    const loginLimits = clientDb.collection(LOGIN_LIMIT_COLLECTION)
    await loginLimits.createIndex(IP_INDEX)

    db = new DbHandler(client, clientDb)
}

class DbHandler {

    private readonly client: MongoClient
    private readonly db: Db

    public readonly users: UserHandler
    public readonly logs: LogHandler

    constructor(client: MongoClient, db: Db) {
        this.client = client
        this.db = db
        this.users = new UserHandler(client, db)
        this.logs = new LogHandler(db)
    }

}