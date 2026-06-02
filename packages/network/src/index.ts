
const PORT = 9000;

// 1. Start the TCP Server
const server = Bun.listen({
    hostname: "localhost",
    port: PORT,
    socket: {
        open(socket) {
            console.log("[Server] A peer connected!");
        },
        data(socket, data) {
            const message = new TextDecoder().decode(data);
            console.log(`[Server] Received: "${message}"`);
            
            // Echo the message back to the client
            socket.write(`Echo: ${message}`);
        },
        close(socket) {
            console.log("[Server] Peer disconnected.");
        },
        error(socket, error) {
            console.error("[Server] Error:", error);
        }
    }
});

console.log(`[Server] Listening on tcp://${server.hostname}:${server.port}`);

// 2. Start the TCP Client and Connect to the Server
const client = await Bun.connect({
    hostname: "localhost",
    port: PORT,
    socket: {
        open(socket) {
            console.log("[Client] Connected to server!");
            // Send initial data to the server
            socket.write("Hello from the TCP Client!");
        },
        data(socket, data) {
            const reply = new TextDecoder().decode(data);
            
            // Close the connection after receiving the reply
            console.log(`[Client] Received reply: "${reply}"`);
            setTimeout(() => {
                console.log("connection still ON")
            }, 9000);
            socket.end();
        },
        close(socket) {
            console.log("[Client] Connection closed.");
            // Stop the server so the process can exit
            server.stop();
        },
        error(socket, error) {
            console.error("[Client] Error:", error);
        }
    },
});