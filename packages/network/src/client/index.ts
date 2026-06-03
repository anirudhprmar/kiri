import {ProtocolCategory, type HelloProtocol } from "@chat/protocol";

const clientHello:HelloProtocol = {
    id: "1",
    username: "Anirudh",
    timestamp: Date.now(),
    listeningPort: 9000,
    nodeId: "1",
    category: ProtocolCategory.HELLO
} 



const client = await Bun.connect({
    hostname: "localhost",
    port: 9000,
    socket: {
        open(socket) {
            console.log("[NODE] Connected to server!");
            socket.write(JSON.stringify(clientHello));
        },
        data(socket, data) {
            const reply = new TextDecoder().decode(data);
            console.log(`[NODE] Received reply: "${reply}"`);
            console.log("[NODE] Closing connection.");
            socket.end();
        },
        close() {
            console.log("[NODE] Connection closed.");
        },
        error(error) {
            console.error("[NODE] Error:", error);
        }
    }
});