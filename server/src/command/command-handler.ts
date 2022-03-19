
import { Player } from "../player/player"

export type CommandCallback = (player: Player, args: string[]) => void

interface CommandDetails {
    callback: CommandCallback,
    rank: number
}

export class CommandHandler {

    private commands = new Map<string, CommandDetails>()

    public on(command: string, callback: CommandCallback, rank=0) {
        this.commands.set(command, {
            callback: callback,
            rank: rank
        })
    }

    public execute(player: Player, line: string) {
        //find arguments separated by space, or surrounded by 2 quotes
        const regex = /[^\s"]+|"([^"]+)"/g

        let args = [] as string[]

        let match: RegExpExecArray;
        while((match = regex.exec(line)) != null) {
            args.push(match[1] != null ? match[1] : match[0])
        }
        
        const command = args.shift()
        const details = this.commands.get(command)

        if(details == null || player.rank < details.rank) {
            return
        }

        details.callback(player, args)
    }

}
