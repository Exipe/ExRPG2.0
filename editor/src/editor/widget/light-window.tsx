import React = require("react");
import { Button } from "../../component/button";
import { useEngine } from "../../engine/engine-provider"
import { isAmbientLight, Light } from "../../engine/light-settings";

export const LightWindow = () => {
    const { lightSettings } = useEngine();
    const defaultLight = React.useMemo(() => lightSettings.getLight(), []);
    const defaultAmbient = isAmbientLight(defaultLight);

    const getDefault = React.useCallback((idx: number) => defaultAmbient 
        ? defaultLight.light[idx].toFixed(1) 
        : "1.0", []);

    const [ambient, setAmbient] = React.useState(defaultAmbient);
    const cycle = !ambient;

    const [rInput, setRInput] = React.useState(getDefault(0))
    const [gInput, setGInput] = React.useState(getDefault(1))
    const [bInput, setBInput] = React.useState(getDefault(2))

    const update = () => {
        if(ambient) {
            lightSettings.setLight([
                Number(rInput), 
                Number(gInput), 
                Number(bInput)]);
        } else {
            lightSettings.useCycle();
        }
    }

    const clrValid = (input: string) => {
        const clr = Number(input);
        if(isNaN(clr)) {
            return false;
        }

        return clr >= 0 && clr <= 1;
    }

    const inputValid = cycle || (clrValid(rInput) && clrValid(gInput) && clrValid(bInput));

    return <div>
        <div className="optionsGrid">
            <div>Day/night cycle:</div>
            <input
                type="checkbox"
                checked={cycle}
                onChange={(e) => setAmbient(!(e.target.checked))} />

            <div>R:</div>
            <input
                size={3}
                disabled={cycle}
                onChange={(e) => setRInput(e.target.value)}
                value={rInput}
            ></input>

            <div>G:</div>
            <input
                size={3}
                disabled={cycle}
                onChange={(e) => setGInput(e.target.value)}
                value={gInput}
            ></input>

            <div>B:</div>
            <input
                size={3}
                disabled={cycle}
                onChange={(e) => setBInput(e.target.value)}
                value={bInput}
            ></input>
        </div>

        <br />
        <Button
            enabled={inputValid}
            onClick={update}
        >
            Update
        </Button>
    </div>
}