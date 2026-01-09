
import React = require("react");

export function UpdateContainer(props: any) {
    const [text, setText] = React.useState("Loading...")

    React.useEffect(() => {
        fetch("updates.txt")
        .then(res => res.text())
        .then(text => setText(text))
    }, [])

    return <div id="update-container">
        <h2>Updates</h2>
        <br />
        {text}
    </div>
}