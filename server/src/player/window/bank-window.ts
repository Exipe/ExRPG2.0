
import { Bank } from "../../item/container/bank";
import { Player } from "../player";
import { PrimaryWindow } from "./p-window";

export class BankWindow implements PrimaryWindow {

    public readonly id = "Bank"

    private readonly player: Player
    private readonly bank: Bank

    constructor(player: Player) {
        this.player = player
        this.bank = player.bank
    }

    open() {
        this.bank.update()
    }

}