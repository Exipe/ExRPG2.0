
import React = require("react")
import { ChatModel } from "../game/model/chat-model"
import { FormatText } from "./format-text"
import { useChat } from "./hooks"
import "./chat-box.scss"

interface ChatButtonProps {
    onOpenChat: () => void
}

function OpenChatButton(props: ChatButtonProps) {
    return <div id="open-chat-button" onClick={props.onOpenChat} />
}

interface ChatProps {
    onCloseChat: () => void
    chat: ChatModel
}

function ChatBox(props: ChatProps) {
    const chat = props.chat

    const [messages, setMessages] = React.useState(props.chat.messages.value)
    const [input, setInput] = React.useState("")
    const inputRef = React.useRef(null as HTMLInputElement)

    React.useEffect(() => {
        chat.messages.register(setMessages)

        return () => chat.messages.unregister(setMessages)
    }, [])

    React.useEffect(() => {
        const onEnter = (e: KeyboardEvent) => {
            if(e.key == "Enter") {
                inputRef.current.focus()
            }
        }

        document.addEventListener("keydown", onEnter)

        return () => {
            document.removeEventListener("keydown", onEnter)
        }
    })

    function enterMessage() {
        chat.sendMessage(input)
        setInput("")
    }

    return <div className="box-standard" id="chat-box">
        <div id="close-chat" className="minimize-button" onClick={props.onCloseChat}></div>

        <div id="chat-box-message-area">
            {messages.map((m, i) => <p key={i}><FormatText>{m}</FormatText></p>)}
        </div>

        <input id="chat-box-input" 
               value={input} 
               autoComplete="off"
               ref={inputRef}
               onChange={(e) => { setInput(e.target.value) }}
               onKeyDown={(e) => { if(e.key == "Enter" && input.length > 0) enterMessage() }}
               maxLength={100}></input>
    </div>
}

export function ChatArea() {
    const chat = useChat();
    const [viewChat, setViewChat] = React.useState(true)

    let content = <OpenChatButton onOpenChat={() => { setViewChat(true) }} />

    if(viewChat) {
        content = <ChatBox chat={chat} onCloseChat={() => { setViewChat(false) }} />
    }

    return <div id="chat-area">
        {content}
    </div>
}