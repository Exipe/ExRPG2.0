import { hash, compare } from "bcrypt";
import { Db, MongoClient } from "mongodb";
import { Progress } from "../player/progress/progress";
import { currentTime, timeSince } from "../util/util";

/*
Letters, numbers, spaces
No spaces in the beginning or the end
No 2 spaces in a row
*/
const NAME_REGEX = /^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$/

export const USER_COLLECTION = "users"
export const ID_INDEX = "userId"
export const NAME_INDEX = "username"
const PASSWORD = "password"
const PROGRESS = "progress"
const BAN = "banned"

export const LOGIN_LIMIT_COLLECTION = "loginLimits"
export const IP_INDEX = "userIp"
const FAIL = "attempts"
const LAST_ATTEMPT = "lastAttempt"

interface User {
    persistentId: string,
    name: string,
    progress: Progress
}

export class UserHandler {

    private readonly client: MongoClient
    private readonly db: Db

    private get users() { return this.db.collection(USER_COLLECTION) }

    private get loginLimits() { return this.db.collection(LOGIN_LIMIT_COLLECTION) }

    constructor(client: MongoClient, db: Db) {
        this.client = client
        this.db = db
    }

    /**
     * The transaction that deals with ensuring the user does not exist,
     * and registering the user
     * 
     * @param username
     * the name of the user
     * 
     * @param password
     * the password of the user
     * 
     * @returns
     * whether or not registration was a success, 
     * and if it failed an error message
     */
    private async registerTransaction(username: string, password: string): 
        Promise< [boolean, string?] > 
    {
        const userId = username.toLowerCase()
        const userExistsResults = await this.users.findOne( { [ID_INDEX]: userId } )
        if(userExistsResults) {
            return [false, "That username is already taken."]
        }

        const passwordHash = await hash(password, 10)
        await this.users.insertOne( {
            [ID_INDEX]: userId,
            [NAME_INDEX]: username,
            [PASSWORD]: passwordHash
        } )
        return [true, ""]
    }

    /**
     * Attempts to register a new user in the database
     * 
     * @param username 
     * the name of the new user
     * 
     * @param password 
     * the password of the new user
     * 
     * @returns 
     * whether or not the registration was successful,
     * and if not an error message
     */
    public async register(username: string, password: string):
        Promise< [boolean, string?] > 
    {
        if(username.length > 12 || !NAME_REGEX.test(username)) {
            return [false, "That username is invalid."]
        }

        const session = this.client.startSession()
        try {
            let result: [boolean, string?]
            await session.withTransaction(async () => {
                result = await this.registerTransaction(username, password)
            })
            return result
        } catch(e) {
            await session.abortTransaction()
            return [false, "An unexpected error occured."]
        } finally {
            await session.endSession()
        }
    }

    /**
     * Handles rate limiting of login
     * 
     * @param ip
     * the ip address to check
     * 
     * @returns
     * whether the ip is permitted to make a login attempt,
     * as well as his incremented number of failed attempts
     */
    private async checkLoginAttempts(ip: string):
        Promise< [boolean, number] >    
    {
        let limit = await this.loginLimits.findOne({ [IP_INDEX]: ip })
        let attempts = 0
        let lastLogin = -Infinity

        if(limit) {
            attempts = limit[FAIL]
            lastLogin = limit[LAST_ATTEMPT]
        }

        if(attempts >= 5) {
            let timeLimit = Math.pow(5, attempts-5)
            timeLimit = Math.min(60, timeLimit)
            timeLimit *= 60 * 1000 // convert to milli

            if(timeSince(lastLogin) < timeLimit) {
                return [true, attempts]
            }
        }

        return [false, attempts+1]
    }

    /**
     * The transaction that deals with:
     * 1. ensuring the ip hasn't reached his login rate limit,
     * 2. the user does indeed exist
     * 3. the password is correct
     * 4. the user is not banned
     * 
     * @param username
     * the name of the user
     * 
     * @param ip
     * the ip trying to login
     * 
     * @param password 
     * the password of the user
     * 
     * @returns
     * whether or not the login was successful.
     * including: 
     * if success - a User object,
     * if failure - an error message
     */
    private async loginTransaction(username: string, ip: string, password: string):
        Promise< [boolean, User, string?] >
    {
        const [loginLimit, attempts] = await this.checkLoginAttempts(ip)
        if(loginLimit) {
            return [false, null, "Too many login attempts."]
        }

        const userId = username.toLowerCase()
        const document = await this.users.findOne( { [ID_INDEX]: userId } )
        let valid = document && await compare(password, document[PASSWORD])

        if(!valid) {
            await this.loginLimits.updateOne(
                { [IP_INDEX]: ip },
                { $set: { 
                    [FAIL]: attempts, 
                    [LAST_ATTEMPT]: currentTime() 
                } },
                { upsert: true }
            )
            return [false, null, "Invalid username or password."]
        }

        await this.loginLimits.deleteOne( { [IP_INDEX]: ip } )

        if(document[BAN]) {
            return [false, null, "This user is banned."]
        }

        const user = {
            progress: document[PROGRESS] ? document[PROGRESS] : null,
            name: document[NAME_INDEX],
            persistentId: userId
        } as User
        return [true, user]
    }

    /**
     * Authenticates the user and fetches the corresponding user data
     * from the database
     * 
     * @param username
     * the name of the user
     * 
     * @param ip
     * the ip attempting to make the login
     * 
     * @param password
     * the password of the user
     * 
     * @returns
     * whether or not the login was successful.
     * including: 
     * if success - a User object,
     * if failure - an error message
     */
    public async authenticate(username: string, ip: string, password: string):
        Promise< [boolean, User, string?] >
    {
        const session = this.client.startSession()
        try {
            let result: [boolean, User, string?]
            await session.withTransaction(async () => {
                result = await this.loginTransaction(username, ip, password)
            })
            return result
        } catch(e) {
            await session.abortTransaction()
            return [false, null, "An unexpected error occured."]
        } finally {
            await session.endSession()
        }
    }

    public async save(userId: string, progress: Progress) {
        await this.users.updateOne({ [ID_INDEX]: userId }, {
            $set: { [PROGRESS]: progress }
        })
    }

    public async ban(userId: string) {
        await this.users.updateOne({ [ID_INDEX]: userId }, {
            $set: { [BAN]: true }
        })
    }

}