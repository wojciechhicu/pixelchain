/**
 * Export first known dns's in network
 */
export const dns:DNS = {
        host: 'http://localhost:',
        port: 3000,
        type: 'validator'
}

/** 
 * How DNS looks like 
 * @param host http://localhost
 * @param port 3000
 * @param type router 
 */
interface DNS {
        host: string;
        port: number;
        type: 'validator' | 'router';
}