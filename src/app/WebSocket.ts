import { Server } from "socket.io";
import server from "../app/Express";

const io = new Server(server);

export default io;
