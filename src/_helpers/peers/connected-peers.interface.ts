/**
 * connected peers in memory
 */
export interface ConnectedPeers {
        host: string;
        port: number;
        type: string;
        pixels?: number;
        wallet?: string;
}