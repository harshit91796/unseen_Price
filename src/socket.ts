import io from 'socket.io-client';

let socket: any;

export const initSocket = (userId: string) => {
  if (!socket) {
    socket = io('http://localhost:3007', {
      query: { userId },
    });
  }
  return socket;
};

export const joinChatRoom = (chatId: string) => {
  if (socket) socket.emit('join chat', chatId);
};

export const leaveRoom = (chatId: string) => {
  if (socket) socket.emit('leave chat', chatId);
};

export const onMessageReceived = (callback: (message: any) => void) => {
  if (socket) socket.on('message received', callback);
};

export const socketSendMessage = (message: any) => {
  if (socket) socket.emit('new message', message);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default {
  initSocket,
  joinChatRoom,
  leaveRoom,
  onMessageReceived,
  socketSendMessage,
  disconnectSocket
};
