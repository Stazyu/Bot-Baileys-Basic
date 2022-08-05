import Chats from "../messages/chats";
import { WASocket } from "@adiwajshing/baileys";


export default class Command extends Chats {
    constructor(session: string) {
        super(session);
    }

    async isOnWhatsapp(jid: string[]) {
        this.sock?.onWhatsApp(...jid)
    }
}