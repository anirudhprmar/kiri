import {ProtocolCategory, type HelloProtocol, type MessageProtocol } from "@chat/protocol";
import readline from "node:readline"

interface Peer{
    nodeId:string,
    username:string,
    port:number
    socket:Bun.Socket<undefined>
}
const peerRegistry:Map<string, Peer> = new Map()
const socketBuffers:WeakMap<Bun.Socket<undefined>, string> = new WeakMap()
const seenMessages:Set<string> = new Set();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const username = await new Promise<string>((resolve) => {
    rl.question("Username: ", (answer) => {
        resolve(answer.trim());
    });
})

const port = await new Promise<number>((resolve) => {
    rl.question("Start Port At: ", (answer) => {
        const parsedPort = parseInt(answer.trim())
        resolve(parsedPort) ?? Math.floor(Math.random() * (65535 - 1024)) + 1024;
    })
})

const connectionPort = await new Promise<number>((resolve) => {
    rl.question("Connect To Port: ", (answer) => {
        const parsedPort = parseInt(answer.trim())
        resolve(parsedPort) ?? Math.floor(Math.random() * (65535 - 1024)) + 1024;
    })
})

const nodeId = crypto.randomUUID();

Bun.listen({
    hostname: "localhost",
    port: port,
    socket: {
        open(socket) {
            console.log("[NODE] A peer connected!");
        },
        data(socket, data) {
            readPackets(socket, data, (parsedMessage) => {
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
                
                if (parsedMessage.category === ProtocolCategory.MESSAGE) {

                    if(seenMessages.has(parsedMessage.id)){
                        return;
                    }
                    
                    seenMessages.add(parsedMessage.id);

                    if(parsedMessage.username !== username){
                    console.log(`[${parsedMessage.username}]: ${parsedMessage.message}`);
                    }else{
                        console.log(`[You]: ${parsedMessage.message}`);
                    }
                    peerRegistry.forEach((peer) => {
                        peer.socket.write(JSON.stringify(parsedMessage) + "\n");
                    })
                }
            });
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

    await Bun.connect({
        hostname: "localhost",
        port: connectionPort,
        socket: {
            open(socket) {
                console.log("[NODE] Connected!");
                const hello: HelloProtocol = {
                    id: crypto.randomUUID(),
                    category: ProtocolCategory.HELLO,
                    username,
                    timestamp: Date.now(),
                    listeningPort: port,
                    nodeId
                };
                socket.write(JSON.stringify(hello) + "\n");
                promptMessage(socket);

            },
            data(socket, data) {
                readPackets(socket, data, (parsedReply) => {
                    if (parsedReply.category !== ProtocolCategory.MESSAGE) {
                        return;
                    }
                    if(parsedReply.username !== username){
                    console.log(`[${parsedReply.username}]: ${parsedReply.message}`);
                    }else{
                        console.log(`[You]: ${parsedReply.message}`);
                    }
                });

                peerRegistry.set(nodeId, {
                    nodeId,
                    username,
                    port: connectionPort,
                    socket
                });
            },
            close() {
                console.log("[NODE] Connection closed.");
                peerRegistry.delete(nodeId);
            },
            error(error) {
                console.error("[NODE] Error:", error);
            }
        }
    });

function promptMessage(socket:Bun.Socket<undefined>){

    rl.question("Message: ", (input: string)=>{

        if(input.trim() === "exit"){
            console.log("[NODE] Exiting...");
            socket.end()
            return;
        }
        const message:MessageProtocol = {
            id: crypto.randomUUID(),
            category: ProtocolCategory.MESSAGE,
            username,
            message: input,
            timestamp: Date.now(),
            fromNodeId: nodeId
        };
        socket.write(JSON.stringify(message) + "\n");
        promptMessage(socket);
    })
}

function readPackets(
    socket:Bun.Socket<undefined>,
    data:Uint8Array,
    onPacket:(packet:HelloProtocol | MessageProtocol) => void
) {
    const chunk = new TextDecoder().decode(data);
    const currentBuffer = socketBuffers.get(socket) ?? "";
    const lines = (currentBuffer + chunk).split("\n");
    const unfinishedLine = lines.pop() ?? "";

    socketBuffers.set(socket, unfinishedLine);

    for (const line of lines) {
        if (line.trim() === "") {
            continue;
        }

        try {
            onPacket(JSON.parse(line));
        } catch {
            console.error("[NODE] Invalid packet:", line);
        }
    }
}



