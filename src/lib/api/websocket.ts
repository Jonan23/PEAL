import { writable, derived } from "svelte/store";
import { browser } from "$app/environment";

export interface WebSocketMessage {
  event: string;
  data: unknown;
}

export interface TypingIndicator {
  userId: string;
  conversationId: string;
  isTyping: boolean;
}

interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
}

function createWebSocketStore() {
  let socket: WebSocket | null = null;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const { subscribe, set, update } = writable<WebSocketState>({
    connected: false,
    connecting: false,
    error: null,
  });

  const messageHandlers = new Map<string, Set<(data: unknown) => void>>();

  function connect(token: string) {
    if (!browser || socket?.readyState === WebSocket.OPEN) return;

    update((s) => ({ ...s, connecting: true, error: null }));

    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || "ws://localhost:3001";

    try {
      socket = new WebSocket(`${wsUrl}?token=${token}`);

      socket.onopen = () => {
        reconnectAttempts = 0;
        update((s) => ({
          ...s,
          connected: true,
          connecting: false,
          error: null,
        }));
      };

      socket.onclose = () => {
        update((s) => ({ ...s, connected: false, connecting: false }));

        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          setTimeout(() => connect(token), reconnectDelay * reconnectAttempts);
        }
      };

      socket.onerror = () => {
        update((s) => ({
          ...s,
          connected: false,
          connecting: false,
          error: "WebSocket connection error",
        }));
      };

      socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          const handlers = messageHandlers.get(message.event);
          if (handlers) {
            handlers.forEach((handler) => handler(message.data));
          }
        } catch {
          console.error("Failed to parse WebSocket message");
        }
      };
    } catch {
      update((s) => ({ ...s, connecting: false, error: "Failed to connect" }));
    }
  }

  function disconnect() {
    if (socket) {
      socket.close();
      socket = null;
    }
    update((s) => ({ ...s, connected: false, connecting: false }));
  }

  function on(event: string, handler: (data: unknown) => void) {
    if (!messageHandlers.has(event)) {
      messageHandlers.set(event, new Set());
    }
    messageHandlers.get(event)?.add(handler);

    return () => {
      messageHandlers.get(event)?.delete(handler);
    };
  }

  function emit(event: string, data: unknown) {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ event, data }));
    }
  }

  function joinConversation(conversationId: string) {
    emit("join_conversation", conversationId);
  }

  function leaveConversation(conversationId: string) {
    emit("leave_conversation", conversationId);
  }

  function sendTypingIndicator(conversationId: string, isTyping: boolean) {
    emit("typing", { conversationId, isTyping });
  }

  return {
    subscribe,
    connect,
    disconnect,
    on,
    emit,
    joinConversation,
    leaveConversation,
    sendTypingIndicator,
  };
}

export const websocket = createWebSocketStore();

export const typingIndicators = writable<Map<string, TypingIndicator[]>>(
  new Map(),
);

export function setupTypingHandler() {
  return websocket.on("user_typing", (data) => {
    const indicator = data as TypingIndicator;
    typingIndicators.update((indicators) => {
      const conversationIndicators =
        indicators.get(indicator.conversationId) || [];
      const existing = conversationIndicators.findIndex(
        (i) => i.userId === indicator.userId,
      );

      if (indicator.isTyping) {
        if (existing === -1) {
          conversationIndicators.push(indicator);
        } else {
          conversationIndicators[existing] = indicator;
        }
      } else if (existing !== -1) {
        conversationIndicators.splice(existing, 1);
      }

      indicators.set(indicator.conversationId, conversationIndicators);
      return indicators;
    });
  });
}

export function getTypingUsers(conversationId: string) {
  return derived(typingIndicators, ($indicators) => {
    return $indicators.get(conversationId) || [];
  });
}
