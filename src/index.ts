import Whatsapp from "./core/ConnectWa";

new Whatsapp('./src/session');

// Run Server
import("./app/Express");
import("./app/WebSocket");