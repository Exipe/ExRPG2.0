import { Observable } from "../../util/observable"

export class StatusModel {

    public readonly health = new Observable(0)
    public readonly totalHealth = new Observable(0)

    public readonly level = new Observable(0)
    public readonly experience = new Observable(0)
    public readonly requiredExperience = new Observable(0)

    public readonly name = new Observable("N/A")

}