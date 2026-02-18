import { Server } from "socket.io";
import { verifyAccessToken } from "../config/auth.js";

const connectedUsers = new Map<string, Set<string>>();

let io: Server | null = null;

export function createWebSocketServer(port: number): Server {
  const server = new Server(port, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  server.use(async (socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
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

  server.on("connection", (socket) => {
    const userId = socket.data.userId as string;

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

  return server;
}

export function emitToUser(userId: string, event: string, data: unknown) {
  const userSockets = connectedUsers.get(userId);
  if (userSockets && io) {
    for (const socketId of userSockets) {
      io.to(socketId).emit(event, data);
    }
  }
}

export function emitToConversation(
  conversationId: string,
  event: string,
  data: unknown,
) {
  if (io) {
    io.to(`conversation:${conversationId}`).emit(event, data);
  }
}

export function getIO(): Server | null {
  return io;
}

export function initWebSocket(port: number): Server {
  io = createWebSocketServer(port);
  console.log(`WebSocket server running on port ${port}`);
  return io;
}
