import { io } from "socket.io-client";
import { getAccessToken } from "@/api/client";

let socketInstance = null;

export function getSocket() {
  if (socketInstance) return socketInstance;

  socketInstance = io({
    autoConnect: false,
    transports: ["websocket", "polling"],
    auth: {
      token: null,
    },
  });

  return socketInstance;
}

export function ensureSocketConnected() {
  const socket = getSocket();
  socket.auth = { token: getAccessToken() };
  if (!socket.connected) socket.connect();
  return socket;
}

