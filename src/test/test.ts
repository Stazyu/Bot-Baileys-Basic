import io from "../app/WebSocketClient";

io.on('test.wa', (res) => {
    console.log(res);
});