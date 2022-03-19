import React = require("react");
import { WindowPosition } from "../model/window-model";

export type WindowElementProps = {
    title: string,
    x: number,
    y: number,
    z: number,
    onMove: (x: number, y: number) => void,
    onMoveForward: Function,
}

export const WindowElement: React.FC<WindowElementProps> = 
    ({ title, x, y, z, onMove, onMoveForward, children }) => 
{
    const ref = React.useRef<HTMLDivElement | undefined>();

    const clampPosition = (x: number, y: number) => {
        const maxX = window.innerWidth - ref.current.clientWidth;
        const maxY = window.innerHeight - ref.current.clientHeight;

        x = Math.min(x, maxX);
        y = Math.min(y, maxY);
        x = Math.max(x, 0);
        y = Math.max(y, 0);

        return { x, y };
    }

    const correctPosition = (x: number, y: number) => {
        if(ref.current === undefined) {
            return;
        }

        ref.current.style.top = `${y}px`;
        ref.current.style.left = `${x}px`;
    }

    React.useEffect(() => {
        correctPosition(x, y);
    }, [x, y])

    React.useEffect(() => {
        const { x: _x, y: _y } = clampPosition(x, y);
        onMove(_x, _y);
    }, [])

    const mouseDown = () => {
        document.addEventListener('mouseup', mouseUp);
        document.addEventListener('mousemove', mouseMove);
    }

    const mouseUp = (e: MouseEvent) => {
        document.removeEventListener('mouseup', mouseUp);
        document.removeEventListener('mousemove', mouseMove);

        const { x, y } = clampPosition(e.clientX, e.clientY);
        
        onMove(x, y);
    }

    const mouseMove = (e: MouseEvent) => {
        e.preventDefault();
        correctPosition(e.clientX, e.clientY);
    }

    return <div ref={ref} className="windowElement" 
        onMouseDown={() => onMoveForward()}
        style={{
            zIndex: z
        }}
    >
        <div onMouseDown={mouseDown} 
            className="windowElementTitle"
        >
            {title}
        </div>

        <div className="windowElementBody">
            {children}
        </div>
    </div>
};
