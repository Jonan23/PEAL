import { createServer } from "http";
import { Server } from "socket.io";
import { verifyAccessToken } from "../config/auth.js";

interface UserSocket {
  userId: string;
  socketId: string;
}

const connectedUsers = new Map<string, Set<string>>();

export function createWebSocketServer(port: number) {
  const io = new Server(port, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const payload = await verifyAccessToken(token);
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId;

    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Set());
    }
    connectedUsers.get(userId)?.add(socket.id);

    console.log(`User ${userId} connected with socket ${socket.id}`);

    socket.on("join_conversation", (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`User ${userId} joined conversation ${conversationId}`);
    });

    socket.on("leave_conversation", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${userId} left conversation ${conversationId}`);
    });

    socket.on(
      "typing",
      (data: { conversationId: string; isTyping: boolean }) => {
        socket.to(`conversation:${data.conversationId}`).emit("user_typing", {
          userId,
          conversationId: data.conversationId,
          isTyping: data.isTyping,
        });
      },
    );

    socket.on("disconnect", () => {
      connectedUsers.get(userId)?.delete(socket.id);
      if (connectedUsers.get(userId)?.size === 0) {
        connectedUsers.delete(userId);
      }
      console.log(`User ${userId} disconnected`);
    });
  });

  return io;
}

export function emitToUser(userId: string, event: string, data: unknown) {
  const userSockets = connectedUsers.get(userId);
  if (userSockets) {
    for (const socketId of userSockets) {
      io?.to(socketId).emit(event, data);
    }
  }
}

export function emitToConversation(
  conversationId: string,
  event: string,
  data: unknown,
) {
  io?.to(`conversation:${conversationId}`).emit(event, data);
}

let io: Server | null = null;

export function getIO() {
  return io;
}

export function initWebSocket(port: number) {
  io = createWebSocketServer(port);
  console.log(`WebSocket server running on port ${port}`);
  return io;
}
