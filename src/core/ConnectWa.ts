import WASocket, { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, MessageUpsertType, proto, WASocket as socket } from "@adiwajshing/baileys";
import { Boom } from "@hapi/boom";
import { info } from "console";
import P from "pino";
import pretty from "pino-pretty";
import rimraf from "rimraf";
import path from "path";

import { conn } from "../app/Express";
import { MsgHandler } from '../handlers/MsgHandler';
import connectfunc from "../utils/functions";

let valAuth: ReturnType<typeof useMultiFileAuthState> | undefined;

export default class Connect {
    public session: string;
    protected multi?: boolean;
    public sock: socket | undefined;
    public mess: { messages: proto.IWebMessageInfo[], type: MessageUpsertType } | undefined;
    protected msgHandler!: MsgHandler;
    constructor(session: string, multi?: boolean) {
        this.session = session
        this.multi = multi;

        this.createWA();
    }

    protected async createWA() {
        const { version, isLatest } = await fetchLatestBaileysVersion()
        const { state, saveCreds } = await useMultiFileAuthState(this.session);
        info(`Whatsapp Web Version : ${version}`)
        // if (!valAuth) valAuth = await useMultiFileAuthState(session)

        this.sock = WASocket({
            auth: state,
            logger: P({ level: 'info' }, pretty({ colorize: true })),
            printQRInTerminal: true,
            version: version
        })

        this.sock.ev.on('creds.update', async () => {
            await saveCreds();
        })

        this.sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
                console.log('connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect)
                // reconnect if not logged out
                if (shouldReconnect) {
                    this.createWA();
                } else {
                    console.log('Silahkan Scan Ulang Qr Code Bot..');
                    this.deleteSession(() => {
                        process.exit(401);
                    })
                }
            } else if (connection === 'open') {
                console.log('opened connection')
            }
        })

        this.prepareMsgHandler();

        // this.sock.ev.on('messages.upsert', async (mess) => {
        //     const { messages, type } = mess;
        //     await chatEvent(mess, this.sock!);
        //     this.mess = mess;
        // });

        // Message Update 
        this.sock.ev.on('messages.update', (res) => {
            // console.log(res);
        })
        conn(this.sock);
        connectfunc(this.sock);
        return this.sock;
    }

    // Handle Message
    protected prepareMsgHandler() {
        this.msgHandler = new MsgHandler(this.sock!);
        return this.msgHandler.eventHandler();
    }

    // Log Out Whatsapp
    private deleteSession(callback: () => void): void {
        rimraf(path.join(__dirname, '../session'), (err) => {
            if (err) {
                console.log(err);
                console.log('Gagal menghapus session!');
            } else {
                console.log('Berhasil menghapus session..');
                callback();
            }
        })
    }
}