"use client";

import { io, Socket } from "socket.io-client";
import { getToken } from "./api";

let socket: Socket | null = null;

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "")
  : "http://localhost:5000";

export function connectSocket(): Socket {
  if (socket?.connected) return socket;

  const token = getToken();
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log("Socket connected");
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
