export const dns:DNS = {
        host: 'http://localhost:',
        port: 3000,
        type: 'validator'
}
interface DNS {
        host: string;
        port: number;
        type: 'validator' | 'router'
}