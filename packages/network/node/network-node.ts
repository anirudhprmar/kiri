import chalk from "chalk";
import {ProtocolCategory, type HelloProtocol, type MessageProtocol } from "@chat/protocol";
import { CommandParser, logger, makeBox, spinner } from "@chat/cli";
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
    rl.question(chalk.cyan("Username: "), (answer) => {
        resolve(answer.trim());
    });
})

const port = await new Promise<number>((resolve) => {
    rl.question(chalk.cyan("Start Port At: "), (answer) => {
        const parsedPort = parseInt(answer.trim())
        resolve(parsedPort) ?? Math.floor(Math.random() * (65535 - 1024)) + 1024;
    })
})

const connectionPort = await new Promise<number>((resolve) => {
    rl.question(chalk.cyan("Connect To Port: "), (answer) => {
        const parsedPort = parseInt(answer.trim())
        resolve(parsedPort) ?? Math.floor(Math.random() * (65535 - 1024)) + 1024;
    })
})

const nodeId = crypto.randomUUID();
const parser = new CommandParser();

logger.divider();
console.log(makeBox("Node Info", [
    `  ${chalk.bold("Username")}  ${chalk.green(username)}`,
    `  ${chalk.bold("Node ID")}    ${chalk.dim(nodeId)}`,
    `  ${chalk.bold("Port")}       ${chalk.cyan(port)}`,
].join("\n")));
logger.divider();

Bun.listen({
    hostname: "localhost",
    port: port,
    socket: {
        open(socket) {
            logger.success(`Peer connected from ${socket.remoteAddress}:${socket.remotePort}`);
        },
        data(socket, data) {
            readPackets(socket, data, (parsedMessage) => {
                if (parsedMessage.category === ProtocolCategory.HELLO) {
                    peerRegistry.set(parsedMessage.nodeId, {
                        nodeId: parsedMessage.nodeId,
                        username: parsedMessage.username,
                        port: parsedMessage.listeningPort,
                        socket:socket
                    })
                    console.log(makeBox("Peer Connected", [
                        `  ${chalk.bold("Username")}  ${chalk.green(parsedMessage.username)}`,
                        `  ${chalk.bold("Node ID")}    ${chalk.dim(parsedMessage.nodeId)}`,
                        `  ${chalk.bold("Port")}       ${chalk.cyan(parsedMessage.listeningPort)}`,
                        `  ${chalk.bold("Peers")}      ${chalk.yellow(peerRegistry.size)}`,
                    ].join("\n")));
                }

                if (parsedMessage.category === ProtocolCategory.MESSAGE) {

                    if(seenMessages.has(parsedMessage.id)){
                        return;
                    }

                    seenMessages.add(parsedMessage.id);

                    logger.message(parsedMessage.username, parsedMessage.message, parsedMessage.fromNodeId === nodeId);
                    peerRegistry.forEach((peer) => {
                        peer.socket.write(JSON.stringify(parsedMessage) + "\n");
                    })
                }
            });
        },
        close(socket) {
            logger.warn("Peer disconnected.");
            peerRegistry.forEach((peer) => {
                if (peer.socket === socket) {
                    peerRegistry.delete(peer.nodeId);
                }
            });
            logger.info(`Connected Peers: ${peerRegistry.size}`);
        },
        error(error) {
            logger.error(`Listener error: ${error}`);
        }
    }
});

await Bun.connect({
    hostname: "localhost",
    port: connectionPort,
    socket: {
        open(socket) {
            logger.success(`Connected to peer on port ${connectionPort}`);
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

                if (seenMessages.has(parsedReply.id)) {
                    return;
                }

                seenMessages.add(parsedReply.id);

                logger.message(parsedReply.username, parsedReply.message, parsedReply.fromNodeId === nodeId);
            });

            peerRegistry.set(nodeId, {
                nodeId,
                username,
                port: connectionPort,
                socket
            });
        },
        close() {
            logger.warn("Connection to peer closed.");
            peerRegistry.delete(nodeId);
        },
        error(error) {
            logger.error(`Connection error: ${error}`);
        }
    }
});

function promptMessage(socket:Bun.Socket<undefined>){

    rl.question(chalk.dim("Message: "), (input: string)=>{

        const handled = parser.parse(input, { socket });
        if (handled) {
            promptMessage(socket);
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
            logger.error(`Invalid packet: ${line}`);
        }
    }
}


parser.registerAll([
    {
        name: "help",
        description: "Show available commands",
        usage: "/help",
        handler: () => {
            console.log(parser.getHelp());
        }
    },
    {
        name: "connect",
        description: "Connect to a peer on the specified port",
        usage: "/connect <port>",
        handler: async (args) => {
            const targetPort = parseInt(args[0] ?? "");
            if (isNaN(targetPort)) {
                logger.error("Usage: /connect <port>");
                return;
            }

            const s = spinner(`Connecting to port ${targetPort}...`);
            try {
                await Bun.connect({
                    hostname: "localhost",
                    port: targetPort,
                    socket: {
                        open(socket) {
                            s.succeed(chalk.green(`Connected to peer on port ${targetPort}`));
                            const hello: HelloProtocol = {
                                id: crypto.randomUUID(),
                                category: ProtocolCategory.HELLO,
                                username,
                                timestamp: Date.now(),
                                listeningPort: port,
                                nodeId
                            };
                            socket.write(JSON.stringify(hello) + "\n");
                        },
                        data(socket, data) {
                            readPackets(socket, data, (parsedMessage) => {
                                if (parsedMessage.category === ProtocolCategory.HELLO) {
                                    peerRegistry.set(parsedMessage.nodeId, {
                                        nodeId: parsedMessage.nodeId,
                                        username: parsedMessage.username,
                                        port: parsedMessage.listeningPort,
                                        socket
                                    });
                                    console.log(makeBox("Peer Connected", [
                                        `  ${chalk.bold("Username")}  ${chalk.green(parsedMessage.username)}`,
                                        `  ${chalk.bold("Node ID")}    ${chalk.dim(parsedMessage.nodeId)}`,
                                        `  ${chalk.bold("Port")}       ${chalk.cyan(parsedMessage.listeningPort)}`,
                                        `  ${chalk.bold("Peers")}      ${chalk.yellow(peerRegistry.size)}`,
                                    ].join("\n")));
                                }

                                if (parsedMessage.category === ProtocolCategory.MESSAGE) {
                                    if (seenMessages.has(parsedMessage.id)) return;
                                    seenMessages.add(parsedMessage.id);

                                    logger.message(parsedMessage.username, parsedMessage.message, parsedMessage.fromNodeId === nodeId);

                                    peerRegistry.forEach((peer) => {
                                        peer.socket.write(JSON.stringify(parsedMessage) + "\n");
                                    });
                                }
                            });
                        },
                        close() {
                            logger.warn(`Connection to peer on port ${targetPort} closed.`);
                        },
                        error(err) {
                            s.fail(chalk.red(`Connection to port ${targetPort} failed: ${err}`));
                        }
                    }
                });
            } catch (err) {
                s.fail(chalk.red(`Connection to port ${targetPort} failed: ${err}`));
            }
        }
    },
    {
        name: "peers",
        description: "List connected peers",
        usage: "/peers",
        handler: () => {
            if (peerRegistry.size === 0) {
                logger.warn("No peers connected.");
                return;
            }
            const lines: string[] = [];
            peerRegistry.forEach((peer) => {
                lines.push(`  ${chalk.green(peer.username)} ${chalk.dim(`(${peer.nodeId.slice(0, 8)}...)`)} @${chalk.cyan(`localhost:${peer.port}`)}`);
            });
            console.log(makeBox(`Peers (${peerRegistry.size})`, lines.join("\n")));
        }
    },
    {
        name: "topology",
        description: "Show network topology",
        usage: "/topology",
        handler: () => {
            const lines: string[] = [];
            lines.push(`  ${chalk.bold(chalk.green(username))} ${chalk.dim(`(${nodeId.slice(0, 8)}...)`)} @ ${chalk.cyan(`localhost:${port}`)} ${chalk.dim("(you)")}`);
            peerRegistry.forEach((peer) => {
                lines.push(`  ${chalk.dim("└─")} ${chalk.green(peer.username)} ${chalk.dim(`(${peer.nodeId.slice(0, 8)}...)`)} @ ${chalk.cyan(`localhost:${peer.port}`)}`);
            });
            console.log(makeBox("Network Topology", lines.join("\n")));
        }
    },
    {
        name: "clear",
        description: "Clear the terminal screen",
        usage: "/clear",
        handler: () => {
            process.stdout.write("\x1Bc");
        }
    },
    {
        name: "exit",
        description: "Disconnect and exit",
        usage: "/exit",
        handler: (args, ctx) => {
            logger.dim("Exiting...");
            const socket = ctx.socket as Bun.Socket<undefined>;
            if (socket) socket.end();
            rl.close();
            process.exit(0);
        }
    }
]);
