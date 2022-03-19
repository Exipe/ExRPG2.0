
import { Player } from "../player";

export type WindowId = "Shop" | "Dialogue" | "Crafting" | "Bank" | "Trade"

export interface PrimaryWindow {
    id: WindowId
    open(p: Player): void
    close?(p: Player): void
}