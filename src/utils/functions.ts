import path from "path";
import { default as axios } from 'axios';
import { readFileSync, writeFileSync } from "fs";
import { AnyMessageContent, downloadContentFromMessage, generateWAMessageFromContent, prepareWAMessageMedia, proto, WAMediaUpload, WASocket, WAUrlInfo } from "@adiwajshing/baileys";
import { ISimplified, Message } from '../types/MsgHandle';
import { randomString } from "../helpers/generate";
import { pngToWebpFromBuffer, pngToWebpFromUrl, mp4ToWebp } from ".";
import { fromBuffer } from "file-type";

let wa: WASocket;
export default function connectfunc(socket: WASocket) {
    wa = socket
}

export async function getBuffer(url: string) {
    return new Promise<Buffer>((resolve, reject) => {
        axios.get(url, {
            responseType: 'arraybuffer'
        })
            .then((res) => {
                const buffer = Buffer.from(res.data, 'utf-8');
                resolve(buffer);
            }).catch((err) => {
                reject(err);
            });
    })
}

export async function downloadMediaWa(msg: ISimplified, ext: string, nameFile?: string): Promise<{ path: string; buffer: Buffer; } | undefined> {
    const { chatMessage, isQuotedMedia, quotedInfo } = msg;
    const mediaMessage = isQuotedMedia ? quotedInfo?.quotedMessage : chatMessage;
    const messageType = Object.keys(mediaMessage!)[0];
    const randomStr = nameFile !== undefined ? nameFile : randomString(4);
    if (messageType === 'imageMessage') {
        const mediaInfo = mediaMessage?.imageMessage!;
        const stream = await downloadContentFromMessage(mediaInfo, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        writeFileSync(path.join(__dirname, '../temp', `${randomStr}${ext}`), buffer);
        return { path: path.join(__dirname, '../temp', `${randomStr}${ext}`), buffer: readFileSync(path.join(__dirname, '../temp', `${randomStr}${ext}`)) }
    } else if (messageType === 'videoMessage') {
        const mediaInfo = mediaMessage?.videoMessage!;
        const stream = await downloadContentFromMessage(mediaInfo, 'video');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        writeFileSync(path.join(__dirname, '../temp', `${randomStr}${ext}`), buffer);
        return { path: path.join(__dirname, '../temp', `${randomStr}${ext}`), buffer: readFileSync(path.join(__dirname, '../temp', `${randomStr}${ext}`)) };
    } else if (messageType === 'audioMessage') {
        const mediaInfo = mediaMessage?.audioMessage!;
        const stream = await downloadContentFromMessage(mediaInfo, 'audio');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        writeFileSync(path.join(__dirname, '../temp', `${randomStr}${ext}`), buffer);
        return { path: path.join(__dirname, '../temp', `${randomStr}${ext}`), buffer: readFileSync(path.join(__dirname, '../temp', `${randomStr}${ext}`)) };
    } else if (messageType === 'stickerMessage') {
        const mediaInfo = mediaMessage?.stickerMessage!;
        const stream = await downloadContentFromMessage(mediaInfo, 'sticker');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        writeFileSync(path.join(__dirname, '../temp', `${randomStr}${ext}`), buffer);
        return { path: path.join(__dirname, '../temp', `${randomStr}${ext}`), buffer: readFileSync(path.join(__dirname, '../temp', `${randomStr}${ext}`)) };
    } else if (messageType === 'documentMessage') {
        const mediaInfo = mediaMessage?.documentMessage!;
        const stream = await downloadContentFromMessage(mediaInfo, 'document');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        writeFileSync(path.join(__dirname, '../temp', `${randomStr}${ext}`), buffer);
        return { path: path.join(__dirname, '../temp', `${randomStr}${ext}`), buffer: readFileSync(path.join(__dirname, '../temp', `${randomStr}${ext}`)) };
    }
}

export const sendText = async (from: string, text: string, options?: { linkPreview?: WAUrlInfo | null, mentions?: string[] | undefined }) => {
    const msg = await wa.sendMessage(from, { text, linkPreview: options?.linkPreview || null, mentions: options?.mentions });
    return msg;
}

export const reply = async (from: string, text: string, quoted: proto.IWebMessageInfo, options?: { linkPreview?: WAUrlInfo | null, mentions?: string[] | undefined }) => {
    const msg = await wa.sendMessage(from, { text, linkPreview: options?.linkPreview || null, mentions: options?.mentions }, { quoted: quoted })
    return msg;
}

/**
 * 
 * @param {String} from groupId atau user_id
 * @param {URL | Buffer} buff  buff Url atau Buffer
 * @param {{capt?: String, jpegThumbnail?: String, msg: String, mentions: String[]}} options Options Message => {caption: teks, jpegThumbnail: url, msg: WAMessage} 
 * @returns 
 */
export const sendImage = async (from: string, buff: URL | Buffer, options?: { capt?: string; jpegThumbnail?: string; msg?: proto.IWebMessageInfo; mentions?: string[]; }) => {
    if (typeof buff === 'string') {
        const msg_result = await wa.sendMessage(from, { caption: options?.capt, image: { url: buff }, jpegThumbnail: options?.jpegThumbnail, mentions: options?.mentions }, { quoted: options?.msg });
        return msg_result;
    } else {
        const msg_result = await wa.sendMessage(from, { caption: options?.capt, image: buff as Buffer, jpegThumbnail: options?.jpegThumbnail, mentions: options?.mentions }, { quoted: options?.msg });
        return msg_result;
    }
}

/**
 * 
 * @param {String} from groupId atau user_id
 * @param {URL | Buffer} buff  buff Url atau Buffer
 * @param {{ptt?: Boolean, msg?: String, mimetype?: String, mentions: String[]}} options Options Message => {ptt: Boolean, msg: WAMessage}
 * @returns 
 */
export const sendAudio = async (from: string, buff: URL | Buffer, options?: { ptt?: boolean; msg?: proto.IWebMessageInfo; mimetype?: string; mentions?: string[]; }) => {
    if (typeof buff === 'string') {
        const msg_result = await wa.sendMessage(from, { audio: { url: buff }, ptt: options?.ptt, mimetype: options?.mimetype, mentions: options?.mentions }, { quoted: options?.msg });
        return msg_result;
    } else {
        const msg_result = await wa.sendMessage(from, { audio: buff as Buffer, ptt: options?.ptt, mimetype: options?.mimetype, mentions: options?.mentions }, { quoted: options?.msg });
        return msg_result;
    }
}

/**
 * 
 * @param {String} from groupId atau user_id
 * @param {URL | Buffer} buff  Url atau Buffer
 * @param {{caption?: String, gifPlayback?: Boolean, jpegThumbnail?: String | URL, msg?: String, mentions: String[]}} options Options Message => {caption: teks, gifplayback: boolean, jpegThumbnail: url, msg: WAMessage}
 * @returns 
 */
export const sendVideo = async (from: string, buff: URL | Buffer, options?: { caption?: string; gifPlayback?: boolean; jpegThumbnail?: string | URL; msg?: proto.IWebMessageInfo; mentions: string[]; }) => {
    if (typeof buff === 'string') {
        const msg_result = await wa.sendMessage(from, { caption: options?.caption, gifPlayback: options?.gifPlayback, video: { url: buff }, mentions: options?.mentions }, { quoted: options?.msg });
        return msg_result;
    } else {
        const msg_result = await wa.sendMessage(from, { caption: options?.caption, gifPlayback: options?.gifPlayback, video: buff as Buffer, mentions: options?.mentions }, { quoted: options?.msg });
        return msg_result;
    }
}

/**
 * 
 * @param {String} from groupId atau user_id
 * @param {URL | Buffer} buff  Url atau Buffer
 * @param {{fileName?: String, mimetype?: String, quoted?: String, mentions: String[]}} options Options Message => {fileName : teks, mimetype: video/webm | audio/webm | application/pdf, quoted: chat}
 * @returns 
 */
export const sendDocument = async (from: string, buff: URL | Buffer, mimetype: string, options?: { fileName?: string; quoted?: proto.IWebMessageInfo; mentions?: string[]; }) => {
    if (typeof buff === 'string') {
        const msg_result = await wa.sendMessage(from, { document: { url: buff }, fileName: options?.fileName, mimetype: mimetype, mentions: options?.mentions }, { quoted: options?.quoted });
        return msg_result;
    } else {
        const msg_result = await wa.sendMessage(from, { document: buff as Buffer, fileName: options?.fileName, mimetype: mimetype, mentions: options?.mentions }, { quoted: options?.quoted });
        return msg_result;
    }
}

/**
 * 
 * @param {String} from groupId atau user_id
 * @param {URL | Buffer} buff Url atau Buffer
 * @param {{height?: Number, width?: Number, msg?: String, mentions: String[]}} options Options Message => Example {height: 100, width: 80}
 * @returns 
 */
export const sendSticker = async (from: string, buff: string | URL | Buffer, options?: { height?: number; width?: number; quoted?: proto.IWebMessageInfo; mentions?: string[]; }) => {
    if (typeof buff === 'string') {
        const msg_result = await wa.sendMessage(from, { sticker: { url: buff } } || { height: options?.height, width: options?.width, mentions: options?.mentions }, { quoted: options?.quoted });
        return msg_result;
    } else {
        const msg_result = await wa.sendMessage(from, { sticker: buff as Buffer } || { height: options?.height, width: options?.width, mentions: options?.mentions }, { quoted: options?.quoted });
        return msg_result;
    }
}

/**
 * 
 * @param {String} from groupId atau user_id
 * @param {URL | Buffer} buff Url atau Buffer
 * @param {{height?: Number, width?: Number, msg?: String, mentions: String[]}} options Options Message => Example {height: 100, width: 80}
 * @returns 
 */
export const sendStickerFromImage = async (from: string, buff: string | Buffer, quoted?: proto.IWebMessageInfo, options?: { packname?: string; authorname?: string; }) => {
    if (typeof buff === 'string') {
        const webpRes = await pngToWebpFromUrl(buff,);
        const msg_result = await sendSticker(from, buff, { quoted });
        return msg_result;
    } else if (Buffer.isBuffer(buff)) {
        const webpRes = await pngToWebpFromBuffer(buff as Buffer);
        const msg_result = await sendSticker(from, buff, { quoted })
        return msg_result;
    }
}

export const sendStickerFromVideo = async (from: string, url: string | Buffer, quoted?: proto.IWebMessageInfo, options?: { packname?: string; authorname?: string; }) => {
    try {
        if (typeof url === 'string') {
            const buff = await getBuffer(url);
            const webp = await mp4ToWebp(buff, { packname: options?.packname, authorname: options?.authorname });
            return sendSticker(from, webp, { quoted: quoted });
        } else if (Buffer.isBuffer(url)) {
            const webp = await mp4ToWebp(url as Buffer, { packname: options?.packname, authorname: options?.authorname });
            return sendSticker(from, webp, { quoted: quoted })
        }
    } catch (err) {
        console.log(err);
        sendText(from, 'Ada masalah!');
    }
}

/**
 * 
 * @param {String} from 
 * @param {URL | Buffer} buff 
 * @param {{caption?: String, gifPlayback?: Boolean, jpegThumbnail?: String | URL, gifPlayback?: Boolean, quoted?: String}} options Options Message => {caption: teks, gifplayback: boolean, jpegThumbnail: url, quoted: chat}
 * @returns 
 */
export const sendMedia = (from: string, buff: string | Buffer, options: { caption?: string; gifPlayback?: boolean; jpegThumbnail?: string; quoted?: proto.IWebMessageInfo; } = {}) => {
    return new Promise<proto.WebMessageInfo | undefined>(async (resolve, reject) => {
        try {
            if (typeof buff === 'string') {
                const type = await axios.head(buff).then(res => res.headers['content-type'].split('/')[0]);
                console.log(type);
                if (type === 'image') {
                    const msg_result = await wa.sendMessage(from, { caption: options.caption, image: { url: buff }, jpegThumbnail: options.jpegThumbnail }, { quoted: options.quoted });
                    resolve(msg_result);
                } else if (type === 'video' || type === 'octet') {
                    const msg_result = await wa.sendMessage(from, { caption: options.caption, gifPlayback: options.gifPlayback, video: { url: buff } }, { quoted: options.quoted });
                    resolve(msg_result);
                }
            } else {
                const type = await fromBuffer(buff);
                if (type?.mime.split('/')[0] === 'image') {
                    const msg_result = await wa.sendMessage(from, { caption: options.caption, image: buff, jpegThumbnail: options.jpegThumbnail }, { quoted: options.quoted });
                    resolve(msg_result);
                } else if (type?.mime.split('/')[0] === 'video' || type?.mime.split('/')[0] === 'octet') {
                    const msg_result = await wa.sendMessage(from, { caption: options.caption, gifPlayback: options.gifPlayback, video: buff }, { quoted: options.quoted });
                    resolve(msg_result);
                }
            }
        } catch (err) {
            reject(err);
        }
    })
}

/**
 * 
 * @param {} from groupId atau user_id
 * @param {} buttons Tombol yang akan dikirim
 * @param {} options Example => Di Bawah
 * @returns 
 * @example const buttons = [
{buttonId: 'id1', buttonText: {displayText: 'Button 1'}, type: 1},
{buttonId: 'id2', buttonText: {displayText: 'Button 2'}, type: 1},
{buttonId: 'id3', buttonText: {displayText: 'Button 3'}, type: 1}
]
const result = sendButton(from, buttons, {text: 'Teks utama', footer: 'Teks Bawah'})
 */
export const sendButton = async (from: string, buttons: proto.IButton[], options?: { text?: string; footer?: string; }) => {
    const buttonMessage = {
        text: options?.text ? options?.text : '',
        footer: options?.footer ? options?.footer : '',
        buttons: buttons,
        headerType: 1
    }
    const msg_result = await wa.sendMessage(from, buttonMessage)
    return msg_result;
}

/**
 * 
 * @param {String} from user_id atau groupId
 * @param {String[]} buttons Isi Buttons
 * @param {URL | Buffer} image Foto yang akan dikirim bareng button
 * @param {{caption?: String, footer?: String}} options 
 * @returns
 * @example const buttons = [
{buttonId: 'id1', buttonText: {displayText: 'Button 1'}, type: 1},
{buttonId: 'id2', buttonText: {displayText: 'Button 2'}, type: 1},
{buttonId: 'id3', buttonText: {displayText: 'Button 3'}, type: 1}
]
const result = await sendButtonWithImage(from, buttons, 'https://i.ibb.co/27TMSmd/Whats-App-Image-2022-01-02-at-21-26-32.jpg', {text: 'Teks utama', footer: 'Teks Bawah'})
 */
export const sendButtonWithImage = async (from: string, buttons: string[], image: string | Buffer, options: { caption?: string; footer?: string; }) => {
    if (typeof image === 'string') {
        const buttonMessage = {
            image: { url: image },
            caption: options.caption ? options.caption : '',
            footer: options.footer ? options.footer : '',
            buttons: buttons,
            headerType: 4
        }
        const msg_result = await wa.sendMessage(from, buttonMessage)
        return msg_result;
    } else {
        const buttonMessage = {
            image: image as Buffer,
            caption: options.caption ? options.caption : '',
            footer: options.footer ? options.footer : '',
            buttons: buttons,
            headerType: 4
        }
        const msg_result = await wa.sendMessage(from, buttonMessage)
        return msg_result;
    }
}

/**
* 
* @param {String} from user_id atau groupId
* @param {String[]} templateButtons Isi Template Buttons
* @param {{text?: String, footer?: String}} options 
* @example const templateButtons = [
{index: 1, urlButton: {displayText: '⭐ Star Baileys on GitHub!', url: 'https://github.com/adiwajshing/Baileys'}},
{index: 2, callButton: {displayText: 'Call me!', phoneNumber: '+1 (234) 5678-901'}},
{index: 3, quickReplyButton: {displayText: 'This is a reply, just like normal buttons!', id: 'id-like-buttons-message'}},
]

const result = sendTemplateButton(from, templateButtons, {text: 'Teks Utama', footer: 'Teks Bawah/Footer'})
*/
export const sendTemplateButton = async (from: string, templateButtons: proto.IHydratedTemplateButton[], options?: { text?: string, footer?: string }) => {
    const templateMessage = {
        text: options?.text !== undefined ? options.text : '',
        footer: options?.footer !== undefined ? options.footer : '',
        templateButtons
    }
    const msg_result = await wa.sendMessage(from, templateMessage);
    return msg_result;
}

/**
 * 
 * @param {String} from user_id atau groupId
 * @param {String[]} templateButtons 
 * @param {URL | Buffer} image
 * @param {{ title: String, content?: String, footer?: String, quoted?: proto.WebMessageInfo}} options 
 * @returns 
 * @example const templateButtons = [{
    urlButton: {
        displayText: 'Text 1',
        url: ''
    }
}, {
    callButton: {
        displayText: 'text 2',
        phoneNumber: ''
    }
}, {
    quickReplyButton: {
        displayText: 'Buttton 3',
        id: 'id 1'
    }
}, {
    quickReplyButton: {
        displayText: 'Button 4',
        id: 'id 2'
    }
}, {
    quickReplyButton: {
        displayText: 'Button 5',
        id: 'id 3'
    }
}]
 */
export const sendTemplateButtonWithImage = async (from: string, templateButtons: string[], image: WAMediaUpload, options: { title: string; content?: string; footer?: string; quoted?: proto.WebMessageInfo; }) => {
    const message = await prepareWAMessageMedia({ image: image }, { upload: wa.waUploadToServer })
    const template = generateWAMessageFromContent(from, proto.Message.fromObject({
        templateMessage: {
            hydratedTemplate: {
                imageMessage: message.imageMessage,
                hydratedTitleText: options.title,
                hydratedContentText: 'Testing',
                hydratedFooterText: options.footer,
                hydratedButtons: templateButtons,
            }
        }
    }), { userJid: from, quoted: options.quoted })
    return wa.relayMessage(from, template.message!, { messageId: template.key.id! });
}

/**
 * 
 * @param {String} from 
 * @param {String[]} sections
 * @param {{title?: String, text?: String, footer?: String, buttonText?: String}} options 
 * @returns
 * @example const sections = [
{
    title: "Section 1",
    rows: [
        {title: "Option 1", rowId: "option1"},
        {title: "Option 2", rowId: "option2", description: "This is a description"}
    ]
},
{
    title: "Section 2",
    rows: [
        {title: "Option 3", rowId: "option3"},
        {title: "Option 4", rowId: "option4", description: "This is a description V2"}
    ]
}
]

const result = await sendListMessage(from, sections, {title: 'Titlenya', text: 'Teks Utama', footer: 'Teks Bawah/Footer', butttonText: 'Teks Buttonnya'})
 */
export const sendListMessage = async (from: string, sections: proto.ISection[], text: string, options: { title?: string; footer?: string; buttonText?: string; }) => {
    const listMessage = {
        text: text,
        footer: options.footer,
        title: options.title,
        buttonText: options.buttonText,
        sections
    }
    const msg_result = await wa.sendMessage(from, listMessage);
    return msg_result;
}

/**
 * 
 * @param {String} from 
 * @param {String[]} sections 
 * @param {URL | Buffer} image
 * @param {{title?: String, text?: String, footer?: String, buttonText?: String}} options 
 * @returns 
 */
export const sendListMessageWithImage = async (from: string, sections: proto.ISection[], image: URL | Buffer, options: { title?: string; text?: string; footer?: string; buttonText?: string; }) => {
    if (typeof image === 'string') {
        const listMessage = {
            image: { url: image },
            text: options.text,
            footer: options.footer,
            title: options.title,
            buttonText: options.buttonText,
            sections
        }
        const msg_result = await wa.sendMessage(from, listMessage);
        return msg_result;
    } else {
        const listMessage = {
            image: image as Buffer,
            text: options.text,
            footer: options.footer,
            title: options.title,
            buttonText: options.buttonText,
            sections
        }
        const msg_result = await wa.sendMessage(from, listMessage);
        return msg_result;
    }
}