
import { InventoryTab } from "./inventory";
import React = require("react");
import { Equipment } from "./equipment";
import { Settings } from "./settings";
import { useGame } from "../game-provider";
import "./tab-area.scss";
import { Skills } from "./skills";

type TabId = "inventory" | "skills" | "equipment" | "settings"

interface TabProps {
    id: TabId,
    tab: TabId | "",
    setTab: (tab: TabId) => void
}

function Tab(props: TabProps) {
    return <div
        className={`tab${props.id == props.tab ? ' openTab' : ''}`}
        onClick={() => props.setTab(props.id)}
        style={{ backgroundImage: `url('ui/${props.id}.png')` }}
    />
}

export function TabArea() {
    const [tab, setTab] = React.useState("" as TabId | "")
    const game = useGame();

    let openTab = (id: TabId) => {
        if (tab != id) {
            setTab(id)
        } else {
            setTab("")
        }
    }

    let displayTab = <></>

    if (tab == "inventory") {
        displayTab = <InventoryTab
            showCtxMenu={(entries, x, y) => { game.ctxMenu.show(entries, x, y) }}
            inventory={game.inventory}
        />
    } else if(tab == "skills") {
        displayTab = <Skills></Skills>;
    } else if (tab == "equipment") {
        displayTab = <Equipment
            equipment={game.equipment}
        />
    } else if (tab == "settings") {
        displayTab = <Settings
            ctxMenu={game.ctxMenu}
            settings={game.settings}
        />
    }

    return <div id="tab-area">
        <div className="box-standard" id="tabs">
            <Tab id="inventory" tab={tab} setTab={openTab} />
            <Tab id="skills" tab={tab} setTab={openTab} />
            <Tab id="equipment" tab={tab} setTab={openTab} />
            <Tab id="settings" tab={tab} setTab={openTab} />
        </div>

        {displayTab}
    </div>

}