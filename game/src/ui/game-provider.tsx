import React = require("react");
import { Game } from "../game/game";

const GameContext = React.createContext(null as Game);

export const GameProvider: React.FC<{ game: Game }> = (props) => {
    return <GameContext.Provider
        value={props.game}>
        {props.children}
    </GameContext.Provider>
}

export const useGame = () => React.useContext(GameContext);
