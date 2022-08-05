import express, { Express, Request, Response } from "express";
import http from "http";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import { WASocket } from "@adiwajshing/baileys";
import { formatter } from "../helpers/formatter";

const PORT = 5000;

const app: Express = express();
const server = http.createServer(app);

let sock: WASocket;

export const conn = (socket: WASocket) => {
    sock = socket
}

app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());
app.use(cors());

app.get('/test', (req: Request, res: Response) => {
    res.json({
        test: "aman"
    })
})

app.get('/wasend', (req: Request, res: Response) => {
    // console.log(req.query);
    sock.sendMessage(formatter(req.query.nomor as string, '@s.whatsapp.net'), { text: req.query.chat as string });
    res.status(200).json(req.query)
})

server.listen(PORT, () => {
    console.log(`Server Listen at Port: ${PORT}`);
})

export default server;