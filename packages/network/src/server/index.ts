import {ProtocolCategory, type HelloProtocol, type MessageProtocol } from "@chat/protocol";

const server = Bun.listen({
    hostname: "localhost",
    port: 9000,
    socket: {
        open(socket) {
            console.log("[NODE] A peer connected!");
        },
        data(socket, data) {
            const message = new TextDecoder().decode(data);
            
            const parsedMessage: HelloProtocol | MessageProtocol = JSON.parse(message);

            if (parsedMessage.category === ProtocolCategory.HELLO) {
                console.log(`[NODE] Received ${parsedMessage.category.toUpperCase()}`);
                console.log(`username: ${parsedMessage.username}`);
                console.log(`listeningPort: ${parsedMessage.listeningPort}`);
                console.log(`nodeId: ${parsedMessage.nodeId}`);
            }
            else if (parsedMessage.category === ProtocolCategory.MESSAGE) {
                console.log(`[NODE] Received ${parsedMessage.category.toUpperCase()}`);
                console.log(`username: ${parsedMessage.username}`);
                console.log(`message: ${parsedMessage.message}`);
            }
            
            socket.write(`${parsedMessage.category.toUpperCase()} packet`);
        },
        close() {
            console.log("[NODE] Peer disconnected.");
        },
        error(error) {
            console.error("[NODE] Error:", error);
        }
    }
});

console.log(`[NODE] Listening on tcp://${server.hostname}:${server.port}`);