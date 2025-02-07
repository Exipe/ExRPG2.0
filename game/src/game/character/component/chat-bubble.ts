
import { Entity } from "exrpg";
import { Component } from "exrpg/dist/entity/component";
import { ChatBubbleModel, ChatBubbleStyle, OverlayAreaModel } from "../../model/overlay-model";

export const CHAT_BUBBLE_COMPONENT = "CHAT_BUBBLE"

const HIDE_BUBBLE_TIME = 5555

export class ChatBubbleComponent extends Component {

    private chatBubble = null as ChatBubbleModel
    private chatBubbleTimeout = -1

    private entity: Entity
    private overlayArea: OverlayAreaModel

    constructor(entity: Entity, overlayArea: OverlayAreaModel) {
        super(CHAT_BUBBLE_COMPONENT)
        this.entity = entity
        this.overlayArea = overlayArea
    }

    private removeChatBubble() {
        this.overlayArea.removeOverlay(this.chatBubble)
        this.chatBubble = null
        this.chatBubbleTimeout = -1
    }

    public showChatBubble(message: string, style: ChatBubbleStyle) {
        if(this.chatBubble != null) {
            this.chatBubble.message.value = message
            this.chatBubble.style.value = style
            clearTimeout(this.chatBubbleTimeout)
        } else {
            this.chatBubble = this.overlayArea.addChatBubble(message, style, ...this.entity.centerAboveCoords)
        }

        this.chatBubbleTimeout = window.setTimeout(() => {
            this.removeChatBubble()
        }, HIDE_BUBBLE_TIME)
    }

    movePx() {
        if(this.chatBubble != null) {
            this.chatBubble.move(...this.entity.centerAboveCoords)
        }
    }

    destroy() {
        if(this.chatBubble != null) {
            clearTimeout(this.chatBubbleTimeout)
            this.removeChatBubble()
        }
    }

    moveTile() {}

    animate(_dt: number) {}

    draw() {}

    initialize() {}


}