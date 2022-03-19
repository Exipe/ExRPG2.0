import React = require("react");
import { Button, ToggleButton } from "../component/button";
import { useWindows } from "./window-provider";

export type WidgetPosition = "option" | "tool";

type Widget = {
    id: string;
    title: string;
    onClick: Function;
    position: WidgetPosition;
    toggled: boolean;
};

export type IWidgetContext = {
    createWindow: (id: string, title: string, body: React.ReactElement, 
        position: WidgetPosition) => void;
    createButton: (id: string, title: string, onClick: Function,
        position: WidgetPosition) => void;
    removeWidget: (id: string) => void;
};

const Context = React.createContext<IWidgetContext>({
    createWindow: () => {},
    createButton: () => {},
    removeWidget: () => {}
});

export const WidgetProvider: React.FC<{}> = ({
    children
}) => {
    const windows = useWindows();
    const [widgets, setWidgets] = React.useState<Widget[]>([]);
    const widgetsRef = React.useRef<Widget[]>();

    widgetsRef.current = widgets;

    const createWidget = (widget: Omit<Widget, "toggled">) => {
        const newWidget: Widget = {
            ...widget,
            toggled: false
        }
        setWidgets((widgets) => [...widgets, newWidget]);
    }

    const updateWidget = (id: string, patch: Partial<Omit<Widget, "id">>) => {
        setWidgets((widgets) => {
            return widgets.map((w) => w.id !== id ? w :
                { ...w, ...patch });
        })
    }

    const createWindow = (id: string, title: string, body: React.ReactElement,
        position: WidgetPosition) => 
    {
        windows.addWindow({
            id,
            title,
            body
        });

        const onClick = () => {
            const widget = widgetsRef.current.find((w) => w.id === id);
            const toggled = !widget.toggled;
            
            updateWidget(id, { toggled });
            windows.update(id, { visible: toggled })
        }

        createWidget({
            id,
            title,
            position,
            onClick,
        });
    }

    const createButton = (id: string, title: string, onClick: Function,
        position: WidgetPosition) =>
    {
        createWidget({
            id,
            title,
            position,
            onClick,
        });
    }

    const removeWidget = (id: string) =>
    {
        setWidgets((widgets) => widgets.filter(w => w.id !== id));
        windows.removeWindow(id);
    }

    const buttons = (position: WidgetPosition) => {
        const _widgets = widgets.filter((w) => w.position === position);

        return _widgets.map((w) =>
            <ToggleButton key={w.id} enabled={w.toggled} onClick={w.onClick}>
                {w.title}
            </ToggleButton>
        );
    };

    const optionWidgets = buttons("option");
    const toolWidgets = buttons("tool");

    return <>
        <div className="widgets" id="optionWidgets">
            {optionWidgets}
        </div>
        <div className="widgets" id="toolWidgets">
            {toolWidgets}
        </div>

        <Context.Provider value={{ createWindow, createButton, removeWidget }}>
            {children}
        </Context.Provider>
    </>
};

export const useWidgets = () => React.useContext(Context);
