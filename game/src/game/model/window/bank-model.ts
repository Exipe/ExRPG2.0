
import { Connection } from "../../../connection/connection";
import { MoveItemPacket, TransferPacket } from "../../../connection/packet";
import { PrimaryWindow } from "../../game";
import { Observable } from "../../../util/observable";
import { ContainerModel, StorageContainerModel } from "../container-model";

export class BankModel extends StorageContainerModel {

    private readonly connection: Connection

    private readonly primaryWindow: Observable<PrimaryWindow>

    public readonly observable = new Observable<ContainerModel>(new ContainerModel([]))

    public readonly id = "bank"

    constructor(primaryWindow: Observable<PrimaryWindow>, connection: Connection) {
        super()
        this.primaryWindow = primaryWindow
        this.connection = connection
    }

    open(bank: ContainerModel) {
        this.observable.value = bank
        this.primaryWindow.value = "Bank"
    }

    public moveItem(fromSlot: number, toSlot: number) {
        this.connection.send(new MoveItemPacket(this.id, fromSlot, toSlot))
    }

    public close() {
        this.primaryWindow.value = "None"
    }

    public deposit(item: string, slot: number, amount?: number) {
        this.connection.send(new TransferPacket("inventory", "bank", item, slot, amount))
    }

    public withdraw(item: string, slot: number, amount?: number) {
        this.connection.send(new TransferPacket("bank", "inventory", item, slot, amount))
    }

}