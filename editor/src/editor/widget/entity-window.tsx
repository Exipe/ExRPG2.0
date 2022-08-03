import React = require("react");
import { EditorEntity, useEditor } from "../editor-provider";
import { useEngine } from "../../engine/engine-provider";

declare var __RES_PATH__: string;

type EntityWindowProps = {
    placeHolder: string,
    search: (input: string) => string[],
    selectEntity: (id: string) => any,
    entity?: EditorEntity
};

const EntityWindow = (props: EntityWindowProps) => {
    const [input, setInput] = React.useState("");
    const { placeHolder, search, 
        selectEntity, entity: object } = props;
    
    const onSelect = (id: string) => {
        setInput("");
        selectEntity(id);
    };

    return <div className="entityWindow">
        <input className="search-input" 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeHolder} />
        
        { input.length > 0 &&
            <ul className="search-list">
                {search(input).map(entity => (
                    <li onClick={() => onSelect(entity)}
                        key={entity}
                    >
                        {entity}
                    </li>
                ))}
            </ul> }

        { object !== undefined && <p>{object.name}</p> }

        { object !== undefined &&
            <div className="entityPreview"
                style={{ backgroundImage: 
                    `url('${object.spritePath}')` }} 
            /> }
    </div>
}

export const ObjectWindow = () => {
    const { object, setObject } = useEditor();
    const { engine } = useEngine();

    const selectObject = (id: string) => {
        const obj = engine.objectHandler.get(id);
        setObject({ 
            ...obj,
            spritePath: `${__RES_PATH__}/${obj.spritePath}.png`
        });
    }

    const search = (name: string) => 
        engine.objectHandler.search(name);

    return <EntityWindow
        placeHolder="Object ID"
        search={search}
        selectEntity={selectObject}
        entity={object} />
}

export const NpcWindow = () => {
    const { npc, setNpc } = useEditor();
    const { engine } = useEngine();

    const selectNpc = (id: string) => {
        const npc = engine.npcHandler.get(id);
        setNpc({ ...npc });
    }

    const search = (name: string) =>
        engine.npcHandler.search(name);

    return <EntityWindow
        placeHolder="NPC ID"
        search={search}
        selectEntity={selectNpc}
        entity={npc} />
}

export const ItemWindow = () => {
    const { item, setItem } = useEditor();
    const { engine } = useEngine();

    const selectItem = (id: string) => {
        const item = engine.itemHandler.get(id);
        setItem({ ...item });
    }

    const search = (name: string) =>
        engine.itemHandler.search(name);

    return <EntityWindow
        placeHolder="Item ID"
        search={search}
        selectEntity={selectItem}
        entity={item} />
}