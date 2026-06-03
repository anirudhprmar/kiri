import {ProtocolCategory, type HelloProtocol } from "@chat/protocol";

const server = Bun.listen({
    hostname: "localhost",
    port: 9000,
    socket: {
        open(socket) {
            console.log("[Server] A peer connected!");
        },
        data(socket, data) {
            const message = new TextDecoder().decode(data);
            
            const parsedMessage: HelloProtocol = JSON.parse(message);
    
            console.log(`[NODE] Received ${parsedMessage.category.toUpperCase()}`);
            console.log(`username: ${parsedMessage.username}`);
            console.log(`listeningPort: ${parsedMessage.listeningPort}`);
            console.log(`nodeId: ${parsedMessage.nodeId}`);
            
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

console.log(`[Server] Listening on tcp://${server.hostname}:${server.port}`);