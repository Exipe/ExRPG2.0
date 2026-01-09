
import React = require("react");
import { ItemData } from "exrpg";
import { Attributes, ATTRIBUTES } from "../../game/model/tab/equipment/attributes";
import { EquipmentModel } from "../../game/model/tab/equipment/equipment-model";

export interface EquipmentProps {
    equipment: EquipmentModel,
}

interface EquipmentSlotProps {
    slot: string,
    item: ItemData,
    unequip: (id: string) => void
}

function EquipmentSlot(props: EquipmentSlotProps) {
    const item = props.item

    let style = {} as React.CSSProperties
    let onClick: () => void

    if (item != null) {
        style.backgroundImage = `url('${item.spritePath}')`
        onClick = () => { props.unequip(item.id) }
    } else {
        style.backgroundImage = `url('ui/equip/${props.slot}.png')`
        onClick = () => { }
    }

    return <div className="scale-icon"
        style={style}
        onClick={onClick}
    />
}

interface PointSpendProps {
    equipment: EquipmentModel
    attributes: Attributes,
    onClose: () => void
}

function PointSpendContainer(props: PointSpendProps) {
    const [points, setPoints] = React.useState(props.attributes.points)
    const [attribValues, setAttribValues] = React.useState(ATTRIBUTES.map(attribType => {
        const attrib = props.attributes.get(attribType[0])

        return {
            name: attribType[1],
            title: attribType[2],
            value: attrib.value,
            points: 0
        }
    }))

    function confirm() {
        props.equipment.spendPoints(attribValues.map((attrib, idx) => {
            return [ATTRIBUTES[idx][0], attrib.points]
        }))
        props.onClose()
    }

    function plus(idx: number) {
        if (points <= 0) {
            return
        }

        setPoints(points - 1)
        setAttribValues(attribValues.map((attrib, idx2) => {
            if (idx != idx2) {
                return attrib
            }

            return {
                ...attrib,
                points: attrib.points + 1,
                value: attrib.value + 1
            }
        }))
    }

    function minus(idx: number) {
        if (attribValues[idx].points <= 0) {
            return
        }

        setPoints(points + 1)
        setAttribValues(attribValues.map((attrib, idx2) => {
            if (idx != idx2) {
                return attrib
            }

            return {
                ...attrib,
                points: attrib.points - 1,
                value: attrib.value - 1
            }
        }))
    }

    return <div id="point-spend-container">
        <div id="point-spend-header">
            <div>Remaining points: {points}</div>
            <div onClick={props.onClose} className="close-button" />
        </div>

        <div id="point-spend-grid">
            {attribValues.map((attrib, idx) =>
                <React.Fragment>
                    <div>{attrib.name}: {attrib.value}</div>
                    <div onClick={() => plus(idx)} className="point-spend-button">+</div>
                    <div onClick={() => minus(idx)} className="point-spend-button">-</div>
                </React.Fragment>
            )}

        </div>
        <div onClick={() => confirm()} id="point-spend-confirm" className="ui-button">Confirm</div>
    </div>
}

export function Equipment(props: EquipmentProps) {
    const equipment = props.equipment
    const [equippedItems, setEquippedItems] = React.useState(equipment.equippedItems.value)
    const [attributes, setAttributes] = React.useState(equipment.attributes.value)
    const [showSpendPoints, setShowSpendPoints] = React.useState(false)

    React.useEffect(() => {
        equipment.equippedItems.register(setEquippedItems)
        equipment.attributes.register(setAttributes)

        return () => {
            equipment.equippedItems.unregister(setEquippedItems)
            equipment.attributes.unregister(setAttributes)
        }
    }, [])

    const unequip = (id: string, slot: string) => props.equipment.unequipItem(id, slot)

    const attribValues = ATTRIBUTES.map(attribType => {
        const attrib = attributes.get(attribType[0])

        let suffix = ""
        if (attrib.armor > 0) {
            suffix = " (+" + attrib.armor + ")"
        } else if (attrib.armor < 0) {
            suffix = " (" + attrib.armor + ")"
        }

        let title = attribType[2]
        if (attribType[0] == "speed_move") {
            const percentage = (attributes.walkSpeed * 100).toFixed(2)
            title += ` (${percentage}%)`
        }

        return {
            name: attribType[1],
            className: attrib.armor >= 0 ? "positive-bonus" : "negative-bonus",
            title: title,
            value: (attrib.total) + suffix
        }
    })

    const createSlot = (slot: string) => (
        <EquipmentSlot slot={slot} item={equippedItems.get(slot)} unequip={id => unequip(id, slot)} />
    )

    return <div id="equipment" className="box-standard tab-content">
        <div id="equipment-grid">
            <div />
            {createSlot("helm")}
            <div />

            {createSlot("sword")}
            {createSlot("plate")}
            {createSlot("shield")}

            <div />
            {createSlot("legs")}
            <div />
        </div>

        {!showSpendPoints &&
            <div id="equipment-attribs">
                <ul id="attribs">
                    {attribValues.map(attrib =>
                        <li key={attrib.name} title={attrib.title}>
                            {attrib.name}: <span className={attrib.className}>{attrib.value}</span>
                        </li>
                    )}
                </ul>

            </div>
        }
        {!showSpendPoints &&
            <div onClick={() => setShowSpendPoints(true)} id="open-point-spend" className="ui-button thick">Assign points ({attributes.points})</div>
        }
        {showSpendPoints &&
            <PointSpendContainer equipment={props.equipment} onClose={() => setShowSpendPoints(false)} attributes={attributes} />
        }
    </div>
}