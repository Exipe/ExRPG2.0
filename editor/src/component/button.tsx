import React = require("react");

export type ButtonProps = {
    children: string;
    onClick: Function;
    enabled: boolean;
};

export const ToggleButton = (props: ButtonProps) => {
    return <div 
        onClick={() => props.onClick()} 
        className={"button" + 
            (props.enabled ? " toggleOn" : "")}
    >
        {props.children}
    </div>
};

export const Button = (props: ButtonProps) => {
    return <div
        onClick={() => props.onClick()}
        className={"button" +
            (props.enabled ? "" : " disabled")}
    >
        {props.children}
    </div>
}