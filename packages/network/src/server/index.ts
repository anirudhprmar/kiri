import {ProtocolCategory, type HelloProtocol, type MessageProtocol } from "@chat/protocol";

interface Peer{
    nodeId:string,
    username:string,
    port:number
    socket:Bun.Socket<undefined>
}
const peerRegistry:Map<string, Peer> = new Map()

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
                peerRegistry.set(parsedMessage.nodeId, {
                    nodeId: parsedMessage.nodeId,
                    username: parsedMessage.username,
                    port: parsedMessage.listeningPort,
                    socket:socket
                })
                console.log(`[NODE] Connected Peers: ${peerRegistry.size}`);
                console.log(`[NODE] ${socket.remoteAddress}:${socket.remotePort} registered as ${parsedMessage.username} (${parsedMessage.nodeId})`);
            }
            else if (parsedMessage.category === ProtocolCategory.MESSAGE) {
                console.log(`[NODE] Received ${parsedMessage.category.toUpperCase()}`);
                console.log(`username: ${parsedMessage.username}`);
                console.log(`message: ${parsedMessage.message}`);
            }
            
            socket.write(`${parsedMessage.category.toUpperCase()} packet`);
        },
        close(socket) {
            console.log("[NODE] Peer disconnected.");
            peerRegistry.forEach((peer) => {
                if (peer.socket === socket) {
                    peerRegistry.delete(peer.nodeId);
                }
            });
            console.log(`[NODE] Connected Peers: ${peerRegistry.size}`);
        },
        error(error) {
            console.error("[NODE] Error:", error);
        }
    }
});

console.log(`[NODE] Listening on tcp://${server.hostname}:${server.port}`);