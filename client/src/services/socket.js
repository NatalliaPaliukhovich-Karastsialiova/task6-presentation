import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;
const SOCKET_URL = API_URL;

if (!window.__socket__) {
  window.__socket__ = io(SOCKET_URL, {
    transports: ["websocket"],
    autoConnect: true,
  });

  window.__socket__.on("connect", () => {
    console.log("Socket connected:", window.__socket__.id);
  });

  window.__socket__.on("disconnect", () => {
    console.log("Socket disconnected");
  });
}

export const socket = window.__socket__;
