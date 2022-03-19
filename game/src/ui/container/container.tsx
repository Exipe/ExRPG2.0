
import { ItemData } from "exrpg";
import React = require("react");
import { Item } from "../../game/model/container-model";

export interface SelectDialogProps {
    item: Item,
    selectAmount: number,
    children: JSX.Element | JSX.Element[],
    onClose: () => void,
    setAmount: (value: number) => void
}

export const MAX_SELECT_AMOUNT = 1_000_000_000

export function SelectDialog(props: SelectDialogProps) {
    const amount = props.selectAmount

    function updateInput(e: React.ChangeEvent<HTMLInputElement>) {
        const numValue = parseInt(e.target.value, 10)
        props.setAmount(isNaN(numValue) ? 0 : numValue)
    }

    return <div className="selectDialog" onClick={e => {e.stopPropagation()}}>
        <div className="closeButton top-right"
            onClick={props.onClose}></div>

        <div className="selectDialogRow">
            <DisplayItem item={props.item} className="selectDialogIcon" />
            <div>{props.item[0].name}</div>
        </div>

        <div className="selectDialogRow">
            <div>Amount:</div>
            <input onChange={updateInput} value={amount.toString()} type="number" min="0" max="" className="selectDialogAmount"></input>
        </div>

        {props.children}
    </div>
}

export interface ContainerSelectProps {
    item: ItemData
    button: string
    onClose: () => void
    onTransfer: (amount: number) => void
}

export function ContainerSelectDialog(props: ContainerSelectProps) {
    const [amount, setAmount] = React.useState(1)

    const transfer = () => {
        if(amount == 0 || amount > MAX_SELECT_AMOUNT) {
            return
        }

        props.onTransfer(amount)
    }

    return <SelectDialog
        selectAmount={amount}
        setAmount={setAmount}
        onClose={props.onClose}
        item={[props.item, 1]}>
        
        <div className="selectDialogButton" onClick={transfer}>
            {props.button}
        </div>
    </SelectDialog>
}

export interface DisplayItemProps {
    item: Item
    className?: string,
    children?: JSX.Element,
    onClick?: (e: React.MouseEvent) => void
    onContext?: (e: React.MouseEvent) => void
}

export function DisplayItem(props: DisplayItemProps) {
    const className = 'scaleIcon' + (props.className ? ` ${props.className}` : '')
    const item = props.item

    const style = {} as React.CSSProperties
    if(item != null) {
        style.backgroundImage = `url('${item[0].spritePath}')`
    }

    return <div className={className} style={style} 
        onClick={props.onClick} onContextMenu={props.onContext}>
        {item != null && item[1] > 1 &&
            <div className="itemAmount">{item[1]}</div>}
        {props.children}
    </div>
}

export interface ItemContainerProps {
    children: JSX.Element[]
    className?: string,
    id?: string,
    onClick?: (e: React.MouseEvent) => void
}

export function ItemContainer(props: ItemContainerProps) {
    const className = 'itemContainer' + (props.className ? ` ${props.className}` : '')
    return <div onClick={props.onClick} id={props.id} className={className}>
        {props.children}
    </div>
}
