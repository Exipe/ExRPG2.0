import React = require("react");
import { Footer } from "./footer";
import { useOptionWidgets } from "./widget/option-widget";
import { useToolWidgets } from "./widget/tool-widget";

export const Editor = () => {
    useToolWidgets();
    useOptionWidgets();

    return <div id="ui">
        <Footer />
    </div>;
};