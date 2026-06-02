export enum ProtocolCategory {
    HELLO = 'hello',
    MESSAGE = 'message',
    PEER = 'peer',
}

export type Protocol = HelloProtocol | MessageProtocol | PeerProtocol;

export interface HelloProtocol {
    id: string;
    username: string;
    timestamp: number;
    listeningPort: number;
    nodeId: string;
    category: ProtocolCategory.HELLO;
}

export interface MessageProtocol {
    id: string;
    username: string;
    message: string;
    timestamp: number;
    category: ProtocolCategory.MESSAGE;
}

export interface PeerProtocol {
    id: string;
    username: string;
    peerAddress: string;
    peerPort: number;
    peerId: string;
    timestamp: number;
    category: ProtocolCategory.PEER;
}