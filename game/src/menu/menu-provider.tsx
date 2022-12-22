import React = require("react");
import { Connection } from "../connection/connection";

export type IMenuContext = {
    errorMessage: string,
    setErrorMessage: (message: string) => void
};

const Context = React.createContext<IMenuContext>(undefined);

export const MenuProvider: React.FC<{}> = ({
    children
}) => {
    const [errorMessage, setErrorMessage] = React.useState("");

    const context: IMenuContext = {
        errorMessage, setErrorMessage
    };

    return <Context.Provider
        value={context}
    >
        {children}
    </Context.Provider>
}

export const useMenu = () => React.useContext(Context);
