import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
// const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://192.168.29.105:6000';
const URL="http://192.168.29.105:4000"

export const socket = io(URL);

