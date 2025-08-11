
import { useState, useEffect, useRef } from "react";
import React = require("react");
import { OpenContextMenu } from "../game/model/context-menu-model";
import { FormatText } from "./format-text";
import { useContextMenu } from "./hooks";

export function ContextMenu() {
    const contextMenu = useContextMenu();
    const observable = contextMenu.observable
    const [entries, setEntries] = useState(observable.value.entries)
    const [position, setPosition] = useState([0, 0] as [number, number])
    const listRef = useRef<HTMLUListElement>()

    useEffect(() => {
        const observer = (value: OpenContextMenu) => {
            setEntries(value.entries)
            setPosition([value.x-8, value.y-8])
        }

        observable.register(observer)
        return () => observable.unregister(observer)
    }, [])

    useEffect(() => {
        if(listRef.current != null) {
            let x = position[0]
            let y = position[1]
            let width = listRef.current.offsetWidth
            let height = listRef.current.offsetHeight

            if(x+width>window.innerWidth) {
                x = window.innerWidth-width
            }
            if(y+height>window.innerHeight) {
                y = window.innerHeight-height
            }

            if(x != position[0] || y != position[1]) {
                setPosition([x, y])
            }
        }
    }, [position])

    if(entries.length == 0) {
        return <></>
    }

    const close = () => {
        setEntries([])
    }

    const displayEntries = entries.map((entry, idx) => {
        const onClick = () => {
            close()
            entry[1]()
        }

        return <li key={idx} onClick={onClick}>
            <FormatText>{entry[0]}</FormatText></li>
    })

    return <ul ref={listRef} onMouseLeave={close} 
        style={{
            left: position[0],
            top: position[1]
        }} 
        id="ctxMenu">
            {displayEntries}
            <li onClick={close}>Cancel</li>
    </ul>
}