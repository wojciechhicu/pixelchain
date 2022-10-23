export const Server: ServerConfig = {
        Host: 'http://localhost',
        Port: 12000,
}

interface ServerConfig {
        Host: string,
        Port: number;
}