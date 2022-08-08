import fs from 'fs';
import path from 'path';
import moment from "moment";
import WaSticker, { StickerTypes } from "wa-sticker-formatter";
import { MessageUpsertType, proto, MessageType, WASocket as Sock, GroupParticipant, downloadMediaMessage } from "@adiwajshing/baileys";

import Whatsapp from '../core/ConnectWa';
import { getBuffer, mp4ToWebp, sendMedia } from "../utils";
import { sendText, downloadMediaWa, sendSticker, sendStickerFromImage, sendStickerFromVideo, sendButton, sendTemplateButton } from '../utils/functions';
import { ICommand } from '../types/ICommand';

moment.locale('jv');

export class MsgHandler {
    protected sock;
    constructor(sock: Sock) {
        this.sock = sock;
    }

    public eventHandler(): void {
        this.sock.ev.on("messages.upsert", (m) => this.chatMsg(m));
    }

    protected async chatMsg(mess: { messages: proto.IWebMessageInfo[], type: MessageUpsertType }) {
        if (mess.type !== 'notify') return;
        if (mess.messages[0].key.remoteJid === 'status@broadcast') return;
        // if (!mess.messages[0].message || mess.messages[0].message?.senderKeyDistributionMessage || mess.messages[0].message?.protocolMessage) return;
        const chat = await this.simplified(mess.messages);
        if (true) await this.sock.sendReceipt(chat.from!, chat.participant!, [chat.id!], 'read');
        console.log(chat);

        const command = fs.readdirSync(path.join(__dirname, '../lib/command'));
        console.log(command);

        const start: any = new Date();
        command.forEach((v, i) => {
            const Command = require('../lib/command/' + v)

            const cmd: ICommand = new Command.default(chat as any);
            if (cmd.command.some(v => v === chat.command)) {
                cmd.execute();
                console.log(new Date() as any - start + 'ms');
            }
        })
        console.log(new Date() as any - start + 'ms');


        // Multi Session Whatsapp
        if (chat.isCmd && chat.command === 'tesbot') {
            const bot = new Whatsapp(path.join(__dirname, '../session2'));
        } else if (chat.isCmd && chat.command === 'tes') {
            // const tes = await downloadMediaWa(chat, '.webp');
            // const buff = await getBuffer('https://i.gifer.com/3nR6.mp4');
            // sendMedia(chat.from, buff, { caption: 'Mantap ', gifPlayback: true });
            // const templateButtons = [
            //     { index: 1, urlButton: { displayText: '⭐ Star Baileys on GitHub!', url: 'https://github.com/adiwajshing/Baileys' } },
            //     { index: 2, callButton: { displayText: 'Call me!', phoneNumber: '+1 (234) 5678-901' } },
            //     { index: 3, quickReplyButton: { displayText: 'This is a reply, just like normal buttons!', id: 'id-like-buttons-message' } },
            // ]
            // sendTemplateButton(chat.from, templateButtons, { text: 'Text', footer: 'Footer' });
            // console.log('CPU :' + process.cpuUsage().system, 'Memory :' + process.memoryUsage());
            console.table(process.cpuUsage())
            console.table(process.memoryUsage())
        }
    }

    protected async simplified(msg: proto.IWebMessageInfo[]) {
        const chat = msg[0];
        if (chat.message?.protocolMessage || chat.message?.senderKeyDistributionMessage) {
            return { ...chat, type: Object.keys(chat.message)[0] as MessageType }
        }

        const chatMessage = chat.message;
        const id = chat.key.id;
        const from = chat.key.remoteJid!;
        const fromMe = chat.key.fromMe;
        const participant = chat.key.participant;
        const isGroup = from?.endsWith('@g.us');
        const content = JSON.stringify(chat.message);
        const type = !!chatMessage ? Object.keys(chat.message!).filter((v, i) => v !== 'messageContextInfo')[0] as MessageType : null;
        const body = chat.message?.conversation ||
            chat.message?.imageMessage?.caption ||
            chat.message?.videoMessage?.caption ||
            chat.message?.extendedTextMessage?.text;
        const messageTimeStamp = chat.messageTimestamp;
        const quotedInfo = type === 'extendedTextMessage' && chat.message?.extendedTextMessage?.contextInfo?.quotedMessage ? chat.message?.extendedTextMessage?.contextInfo : undefined;
        const quotedType = !!quotedInfo ? Object.getOwnPropertyNames(quotedInfo?.quotedMessage)[0] as MessageType : undefined;

        const prefix = '.';
        const botNumber = (this.sock.user?.id)?.split(':')[0] + '@s.whatsapp.net';
        const mentions = type === 'extendedTextMessage' ? quotedInfo?.mentionedJid : undefined;
        const run = process.uptime();
        const runtime = this.secondsToDhms(run);
        const time = moment().format('HH:mm:ss');
        const date = moment().format('Do MMMM YYYY, h:mm:ss a');

        /* ============ Meta User & Owner ============ */
        const user_id = isGroup ? chat?.key?.participant : chat?.key?.remoteJid;
        const owner = ['6283104500832'];
        const pushName = chat.pushName;
        const ownerNumber = owner.map((nomor, i) => this.formatter(nomor), '@s.whatsapp.net');
        const isOwner = ownerNumber.includes(user_id as string);

        /* ============ Meta Group ============= */
        const groupMetadata = isGroup ? await this.sock.groupMetadata(from as string) : null;
        const groupName = isGroup ? groupMetadata?.subject : null;
        const groupId = isGroup ? groupMetadata?.id : null;
        const groupMembers = isGroup ? groupMetadata?.participants : null;
        const groupDesc = isGroup ? groupMetadata?.desc?.toString() : null;
        const groupAdmins = isGroup ? this.getGroupAdmins(groupMembers as any).map(v => {
            return v.id;
        }) : [];
        const isBotGroupAdmin = groupAdmins.includes(botNumber);
        const isGroupAdmin = groupAdmins.includes(user_id as string);

        /* ========== Message type ========== */
        const isMedia = (type === 'imageMessage' || type === 'videoMessage' || type === 'audioMessage' || type === 'stickerMessage');
        const isAudio = type === 'audioMessage';
        const isImage = type === 'imageMessage';
        const isVideo = type === 'videoMessage';
        const isSticker = type === 'stickerMessage';
        const isDocument = type === 'documentMessage';
        const isButtonMessage = type === 'buttonsMessage';
        const isButtonResponseMessage = type === 'buttonsResponseMessage';
        const isTemplateButtonReplyMessage = type === 'templateButtonReplyMessage';
        const isQuotedAudio = type === 'extendedTextMessage' && quotedType === 'audioMessage';
        const isQuotedImage = type === 'extendedTextMessage' && quotedType === 'imageMessage';
        const isQuotedVideo = type === 'extendedTextMessage' && quotedType === 'videoMessage';
        const isQuotedSticker = type === 'extendedTextMessage' && quotedType === 'stickerMessage';
        const isQuotedDocument = type === 'extendedTextMessage' && quotedType === 'documentMessage';
        const isQuotedMedia = isQuotedAudio || isQuotedImage || isQuotedVideo || isQuotedSticker || isQuotedDocument

        const message_prefix = type === 'conversation' && chat?.message?.conversation?.startsWith(prefix) ?
            chat?.message?.conversation : type === 'imageMessage' && chat?.message?.imageMessage?.caption !== null && chat?.message?.imageMessage?.caption?.startsWith(prefix) ?
                chat?.message?.imageMessage?.caption : type === 'videoMessage' && chat?.message?.videoMessage?.caption !== null && chat?.message?.videoMessage?.caption?.startsWith(prefix) ?
                    chat?.message?.videoMessage?.caption : type === 'extendedTextMessage' && chat?.message?.extendedTextMessage?.text?.startsWith(prefix) ?
                        chat?.message?.extendedTextMessage?.text : null;
        const message_button = type === 'buttonsResponseMessage' ?
            chat?.message?.buttonsResponseMessage?.selectedButtonId : type === 'templateMessage' ?
                chat?.message?.templateMessage?.hydratedTemplate?.templateId : type === 'templateButtonReplyMessage' ?
                    chat?.message?.templateButtonReplyMessage?.selectedId : type === 'listResponseMessage' ?
                        chat?.message?.listResponseMessage?.singleSelectReply?.selectedRowId : null;
        let message = type === 'conversation' ?
            chat?.message?.conversation : type === 'extendedTextMessage' ?
                chat?.message?.extendedTextMessage?.text : type === 'imageMessage' ?
                    chat?.message?.imageMessage?.caption : type === 'videoMessage' ?
                        chat?.message?.videoMessage?.caption : null;
        message = String(message).startsWith(prefix) ? null : message;

        const command = message_button !== null
            ? message_button?.toLowerCase()
            : message_prefix !== null
                ? String(message_prefix)?.slice(1)?.trim()?.split(/ +/)?.shift()?.toLowerCase()
                : null;
        const args = message && typeof message !== "object"
            ? message.trim().split(/ +/).slice(1)
            : message_prefix !== null ? message_prefix.trim().split(/ +/).slice(1) : [];
        const far = args !== null ? args.join(" ") : null;
        const isCmd = message && typeof message !== "object"
            ? message.startsWith(prefix)
            : message_prefix !== null ? message_prefix.startsWith(prefix) : false;

        let grettingTime = '';
        if (time <= "03:30:00") {
            grettingTime = 'Selamat Malam'
        } else if (time <= "11:00:00") {
            grettingTime = 'Selamat Pagi'
        } else if (time <= "15:00:00") {
            grettingTime = "Selamat Siang"
        } else if (time <= "18:00:00") {
            grettingTime = "Selamat Sore"
        } else if (time <= "20:00:00") {
            grettingTime = "Selamat Petang"
        } else if (time <= "23:59:00") {
            grettingTime = "Selamat Malam"
        }

        return {
            chat,
            chatMessage,
            id,
            from,
            fromMe,
            participant,
            isGroup,
            content,
            type,
            body,
            messageTimeStamp,
            quotedInfo,
            quotedType,
            botNumber,
            mentions,
            prefix,
            /* Meta User & Owner */
            user_id,
            owner,
            pushName,
            ownerNumber,
            isOwner,
            /* Message */
            message_prefix,
            message_button,
            message,
            /* Message Command */
            command,
            args,
            far,
            isCmd,
            /* Message Type */
            isMedia,
            isAudio,
            isImage,
            isVideo,
            isSticker,
            isDocument,
            isButtonMessage,
            isButtonResponseMessage,
            isTemplateButtonReplyMessage,
            isQuotedAudio,
            isQuotedImage,
            isQuotedVideo,
            isQuotedSticker,
            isQuotedDocument,
            isQuotedMedia,
            /* Meta Group */
            groupMetadata,
            groupName,
            groupId,
            groupMembers,
            groupDesc,
            groupAdmins,
            isBotGroupAdmin,
            isGroupAdmin,
            runtime,
            time,
            date,
            grettingTime,
        }
    }

    private secondsToDhms(seconds: number) {
        seconds = Number(seconds);
        let d = Math.floor(seconds / (3600 * 24));
        let h = Math.floor(seconds % (3600 * 24) / 3600);
        let m = Math.floor(seconds % 3600 / 60);
        let s = Math.floor(seconds % 60);

        let dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
        let hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
        let mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
        let sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
        return dDisplay + hDisplay + mDisplay + sDisplay;
    }

    // Formatter number 0 to 62
    private formatter(number: string, standard = "@c.us") {
        let formatted = number;
        // const standard = '@c.us'; // @s.whatsapp.net / @c.us
        if (!String(formatted).endsWith("@g.us")) {
            // isGroup ? next
            // 1. Menghilangkan karakter selain angka
            formatted = number.replace(/\D/g, "");
            // 2. Menghilangkan angka 62 di depan (prefix)
            //    Kemudian diganti dengan 0
            if (formatted.startsWith("0")) {
                formatted = "62" + formatted.slice(1);
            }
            // 3. Tambahkan standar pengiriman whatsapp
            if (!String(formatted).endsWith(standard)) {
                formatted += standard;
            }
        }
        return formatted;
    }

    private getGroupAdmins(participans: any[]) {
        let admins: GroupParticipant[] = [];
        participans.forEach((v, i) => {
            if (v.admin === 'admin') {
                admins.push(v);
            }
        })
        return admins;
    }
}