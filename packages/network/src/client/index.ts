import {ProtocolCategory, type HelloProtocol, type MessageProtocol } from "@chat/protocol";
import readline from "node:readline"

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})


await Bun.connect({
    hostname: "localhost",
    port: 9000,
    socket: {
        open(socket) {
            console.log("[NODE] Connected to server!");
            const hello: HelloProtocol = {
                id: crypto.randomUUID(),
                category: ProtocolCategory.HELLO,
                username: "Anirudh",
                timestamp: Date.now(),
                listeningPort: 9000,
                nodeId: "client-node"
            };
            socket.write(JSON.stringify(hello));
        },
        data(socket, data) {
            const reply = new TextDecoder().decode(data);
            console.log(`[NODE] received: ${reply}`);
            promptMessage(socket);
        },
        close() {
            console.log("[NODE] Connection closed.");
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
            username: "Anirudh",
            message: input,
            timestamp: Date.now()
        }
        socket.write(JSON.stringify(message))
    })
}