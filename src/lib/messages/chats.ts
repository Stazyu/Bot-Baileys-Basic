import { WASocket, proto, MessageUpdateType } from "@adiwajshing/baileys";
import Whatsapp from "../../core/ConnectWa";

export default class Chats extends Whatsapp {
    constructor(session: string) {
        super(session)
    }

    listenMessage() {
        try {
            const msg = this.mess;
            let chat = msg?.messages[0];

            if (msg?.type !== 'notify') return;
            if (chat?.key.remoteJid === 'status@broadcast') return;
            /* ========== Meta Utama ========== */
            // if (chat.message.protocolMessage !== undefined)
            if (!chat?.message || chat?.message?.senderKeyDistributionMessage || chat?.message?.protocolMessage) return;
            const chatMessage = chat.message;
            const id = chat.key.id;
            const from = chat.key.remoteJid;
            const fromMe = chat.key.fromMe;
            const participant = chat.key.participant;
            const isGroup = from?.endsWith('@g.us');
            const content = JSON.stringify(chat.message);
            const type = Object.keys(chat.message).find((v, i) => v !== 'messageContextInfo');
            const body = (type === 'conversation' && chat.message.conversation) ?
                chat?.message?.conversation : (type === 'imageMessage') && chat?.message?.imageMessage?.caption ?
                    chat?.message?.imageMessage?.caption : (type === 'videoMessage') && chat?.message?.videoMessage?.caption ?
                        chat?.message?.videoMessage?.caption : (type === 'extendedTextMessage') && chat?.message?.extendedTextMessage?.text ?
                            chat?.message?.extendedTextMessage?.text : null;
            const messageTimestamp = chat.messageTimestamp;
            // const totalChat = store.chats.all();
            const quotedInfo = type === 'extendedTextMessage' && chat?.message?.extendedTextMessage?.contextInfo?.quotedMessage !== null || undefined ?
                chat?.message?.extendedTextMessage?.contextInfo : null;
            const quotedType = type === 'extendedTextMessage' && quotedInfo !== null ?
                Object.getOwnPropertyNames(quotedInfo?.quotedMessage)[0] : null;
            // console.log(quotedType);

            // const botNumber = String(this.sock.user.id).split(':')[0] + '@s.whatsapp.net';
            // const mentionedJid = type === 'extendedTextMessage' && chat.message.extendedTextMessage?.contextInfo?.mentionedJid ? chat.message.extendedTextMessage?.contextInfo?.mentionedJid : []
            // let prefix = this.prefix;
            // const run = process.uptime();
            // const runtime = this.secondsToDhms(run);
            // const time = moment().format('HH:mm:ss');
            // const date = moment().format('Do MMMM YYYY, h:mm:ss a');

            // /* ============ Meta User & Owner ============ */
            // const user_idd = isGroup ? chat.key.participant : chat.key.remoteJid;
            // const user_id = /([0-9]{12,14})/gi.exec(user_idd)[0] + '@s.whatsapp.net';
            // const pushName = chat.pushName;
            // const ownerNumber = this.owner.map((nomor, i) => {
            //     return this.formatter(nomor, "@s.whatsapp.net");
            // })
            // const isOwner = ownerNumber.includes(user_id) || false

            // /* ============ Meta Group ============= */
            // const groupMetadata = isGroup ? await this.sock.groupMetadata(from) : null;
            // const groupName = isGroup ? groupMetadata.subject : null;
            // const groupId = isGroup ? groupMetadata.id : null;
            // const groupMembers = isGroup ? groupMetadata.participants : null;
            // const groupDesc = isGroup ? groupMetadata.desc.toString() : null;
            // const groupAdmins = isGroup ? this.getGroupAdmins(groupMembers).map(v => {
            //     return v.id;
            // }) : [];
            // const isBotGroupAdmin = groupAdmins.includes(botNumber);
            // const isGroupAdmin = groupAdmins.includes(user_id);

            // if (true) {
            //     await this.sock.sendReceipt(from, participant, [id], 'read');
            // }

            // /* ========== Message type ========== */
            // // const { audio, buttonsMessage, contact, contactsArray, document, extendedText, groupInviteMessage, image, listMessage, liveLocation, location, product, sticker, text, video } = MessageType
            // const isMedia = (type === 'imageMessage' || type === 'videoMessage' || type === 'audioMessage' || type === 'stickerMessage')
            // const isAudio = type === 'audioMessage'
            // const isImage = type === 'imageMessage'
            // const isVideo = type === 'videoMessage'
            // const isSticker = type === 'stickerMessage'
            // const isDocument = type === "documentMessage"
            // const isButtonMessage = type === 'buttonsMessage'
            // const isButtonResponseMessage = type === 'buttonsResponseMessage'
            // const isTemplateButtonReplyMessage = type === 'templateButtonReplyMessage'
            // const isQuotedAudio = type === 'extendedTextMessage' && content.includes('audioMessage')
            // const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
            // const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
            // const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')
            // const isQuotedDocument = type === 'extendedTextMessage' && content.includes('documentMessage')
            // const isQuotedMedia = isQuotedAudio || isQuotedImage || isQuotedVideo || isQuotedSticker || isQuotedDocument

            // const message_prefix = type === 'conversation' && chat.message.conversation.startsWith(prefix) ?
            //     chat.message.conversation : type === 'imageMessage' && chat.message.imageMessage.caption !== null && chat.message.imageMessage.caption.startsWith(prefix) ?
            //         chat.message.imageMessage.caption : type === 'videoMessage' && chat.message.videoMessage.caption !== null && chat.message.videoMessage.caption.startsWith(prefix) ?
            //             chat.message.videoMessage.caption : type === 'extendedTextMessage' && chat.message.extendedTextMessage.text.startsWith(prefix) ?
            //                 chat.message.extendedTextMessage.text : null;
            // const message_button = type === 'buttonsResponseMessage' ?
            //     chat.message.buttonsResponseMessage.selectedButtonId : type === 'templateMessage' ?
            //         chat.message.templateMessage.hydratedTemplate.quickReplyButton.id : type === 'templateButtonReplyMessage' ?
            //             chat.message.templateButtonReplyMessage.selectedId : type === 'listResponseMessage' ?
            //                 chat.message.listResponseMessage.singleSelectReply.selectedRowId : null;
            // let message = type === 'conversation' ?
            //     chat.message.conversation : type === 'extendedTextMessage' ?
            //         chat.message.extendedTextMessage.text : type === 'imageMessage' ?
            //             chat.message.imageMessage.caption : type === 'videoMessage' ?
            //                 chat.message.videoMessage.caption : null;
            // message = String(message).startsWith(prefix) ? null : message

            // /* Message Command */
            // const command = message_button !== null
            //     ? message_button.toLowerCase()
            //     : message_prefix !== null
            //         ? String(message_prefix).slice(1).trim().split(/ +/).shift().toLowerCase()
            //         : null;
            // const args = message && typeof message !== "object"
            //     ? message.trim().split(/ +/).slice(1)
            //     : message_prefix !== null ? message_prefix.trim().split(/ +/).slice(1) : [];
            // const far = args !== null ? args.join(" ") : null;
            // const isCmd = message && typeof message !== "object"
            //     ? message.startsWith(prefix)
            //     : message_prefix !== null ? message_prefix.startsWith(prefix) : false;

            // /* Ucapan Waktu */
            // let ucapanWaktu = ''
            // if (time <= "03:30:00") {
            //     ucapanWaktu = 'Selamat Malam'
            // } else if (time <= "11:00:00") {
            //     ucapanWaktu = 'Selamat Pagi'
            // } else if (time <= "15:00:00") {
            //     ucapanWaktu = "Selamat Siang"
            // } else if (time <= "18:00:00") {
            //     ucapanWaktu = "Selamat Sore"
            // } else if (time <= "20:00:00") {
            //     ucapanWaktu = "Selamat Petang"
            // } else if (time <= "23:59:00") {
            //     ucapanWaktu = "Selamat Malam"
            // }


            // // Setting Self-Bot
            // if (fromMe && !setting.selfBot && command) return;
            // // Setting Public Bot
            // if (!isOwner && !fromMe && !setting.public && command) return;
            // // Setting Maintenance Bot
            // if (!isOwner && !fromMe && setting.maintenance && command) {
            //     return this.sock.sendMessage(from, { text: 'Mohon Maaf.. Saat ini bot sedang dalam Pemeliharaan/Maintenance🛠️' })
            // }

            return {
                chat,
                chatMessage,
                quotedInfo,
                isGroup,
                // isOwner,
                from,
                // user_idd,
                // user_id,
                // mentionedJid,
                // botNumber,
                // runtime,
                // pushName,
                // message_prefix,
                // message,
                content,
                type,
                // totalChat,
                quotedType,
            }
            //     prefix,
            //     isMedia,
            //     isImage,
            //     isAudio,
            //     isVideo,
            //     isSticker,
            //     isDocument,
            //     isButtonMessage,
            //     isButtonResponseMessage,
            //     isTemplateButtonReplyMessage,
            //     isQuotedAudio,
            //     isQuotedImage,
            //     isQuotedVideo,
            //     isQuotedSticker,
            //     isQuotedDocument,
            //     isQuotedMedia,
            //     isAfkOn,
            //     command,
            //     args,
            //     far,
            //     isCmd,
            //     ownerNumber,
            //     // grup
            //     groupMetadata,
            //     groupName,
            //     groupId,
            //     groupMembers,
            //     groupDesc,
            //     groupAdmins,
            //     isBotGroupAdmin,
            //     isGroupAdmin,
            //     // 
            //     ucapanWaktu,
            //     time,
            //     date
            // })
        } catch (err) {
            console.log(err);
        }
    }
}