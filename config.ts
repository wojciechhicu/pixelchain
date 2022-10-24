export const Server: ServerConfig = {
        Host: 'http://localhost',
        Port: 12000,
        Type: 'validator'
}

interface ServerConfig {
        Host: string;
        Port: number;
        Type: 'validator' | 'router'
}