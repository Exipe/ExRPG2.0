import React = require("react");
import { WindowElement } from "../component/window";
import { WindowModel, WindowPosition } from "../model/window-model";

export type IWindowContext = {
    addWindow: (model: Omit<WindowModel, "position">) => void;
    removeWindow: (id: string) => void;
    update: (id: string, position: Partial<WindowPosition>) => void;
};

const Context = React.createContext<IWindowContext>({
    addWindow: () => {},
    removeWindow: () => {},
    update: () => {}
});

export const WindowProvider: React.FC<{}> = ({
    children
}) => {
    const [windows, setWindows] = React.useState<WindowModel[]>([]);

    const [zCounter, setZCounter] = React.useState(0);

    const moveForward = (id: string) => {
        update(id, { z: zCounter });
        setZCounter((z) => z+1);
    }

    const addWindow = (model: Omit<WindowModel, "position">) => {
        const window: WindowModel = {
            ...model,
            position: {
                visible: false,
                x: 0,
                y: 0,
                z: zCounter,
            }
        }

        setZCounter((z) => z+1);
        setWindows((windows) => [...windows, window]);
    }

    const removeWindow = (id: string) => {
        setWindows((windows) => 
            windows.filter((w) => w.id !== id));
    };

    const update = (id: string, position: Partial<WindowPosition>) => {
        setWindows((windows) => windows.map((w) =>
            w.id !== id ? w : { ...w, position: { 
                ...w.position, ...position } }));
    }

    const windowElements = windows
    .filter((w) => w.position.visible)
    .sort((a, b) => a.position.z - b.position.z)
    .map((m, idx) =>
        <WindowElement
            key={m.id}
            title={m.title}
            x={m.position.x}
            y={m.position.y}
            z={10+idx}
            onMoveForward={() => 
                moveForward(m.id)}
            onMove={(x, y) => 
                update(m.id, { x, y })}
        >
            {m.body}
        </WindowElement>);

    return <>
        {windowElements}

        <Context.Provider value={{ 
            addWindow, removeWindow, 
            update 
        }}>
            {children}
        </Context.Provider>
    </>
}

export const useWindows = () => React.useContext(Context);
