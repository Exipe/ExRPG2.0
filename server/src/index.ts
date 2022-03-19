
import { ConnectionHandler } from "./connection/connection-handler"
import { bindIncomingPackets } from "./connection/incoming-packet"
import { initWorld } from "./world"

import fs from "fs"
import {createServer, Server} from "https"
import WebSocket from "ws"

import dotenv from "dotenv"
import { initDb } from "./db/db"

async function start() {
    dotenv.config()

    const {RES_PATH, DB_URL, PORT} = process.env

    let options = {
        port: Number.parseInt(PORT)
    } as WebSocket.ServerOptions

    let https = null as Server

    if(process.env.CERT && process.env.KEY) {
        https = createServer({
            cert: fs.readFileSync(process.env.CERT),
            key: fs.readFileSync(process.env.KEY)
        })

        options = { server: https }
    }

    console.log("- Starting ExRPG server -")

    await initDb(DB_URL)
    console.log("Connected to database")

    await initWorld(RES_PATH)

    const connectionHandler = new ConnectionHandler(options)
    bindIncomingPackets(connectionHandler)

    if(https != null) {
        https.listen(PORT)
    }

    console.log(`Accepting connections on port: ${PORT}`)
}

start().catch(reason => {
    console.log("Error starting server: ", reason)
})
