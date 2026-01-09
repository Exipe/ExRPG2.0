
import React = require("react");
import { FormatText } from "../format-text";
import { useDialogue, useObservable } from "../hooks";

export function DialogueBox() {
    const dialogueModel = useDialogue();
    const dialogue = useObservable(dialogueModel.observable);

    const clickOption = (index: number) => {
        dialogueModel.clickOption(dialogue.id, index)
    }

    const options = dialogue.options.map((option, idx) =>
        <p key={idx} onClick={ _ => { clickOption(idx) } }>{option}</p>)

    return <div className="window box-gradient" id="dialogue-box">
        <p id="dialogue-name"><FormatText>{dialogue.name}</FormatText></p>

        {dialogue.lines.map((line, idx) => <p key={idx}><FormatText>{line}</FormatText></p>)}

        <div id="dialogue-options">
            {options}
        </div>
    </div>
}
