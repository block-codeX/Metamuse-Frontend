"use client"
import { useEffect, useCallback, useContext, createContext, useRef, useState, RefObject } from 'react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { CHAT_URL } from '@/lib/config';

interface ChatContextType {
  setActiveConversation: (conversationId: string | null) => void;
  sendMessage: (content: any) => void;
  activeConversation: RefObject<string | null>;
  isConnected: boolean;
  updateMessage: (content: any) => void;
  readAllMessages: () => void;
  deleteMessage: (content: any) => void;
  ws: React.RefObject<WebSocket | null>;
}

const ChatContext = createContext<ChatContextType>({} as ChatContextType);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const { getAccessToken } = useAuthStore();
  const activeConversationId = useRef<string | null>(null);
  const MAX_RECONNECT_ATTEMPTS = 10;
  const RECONNECT_INTERVAL = 3000;
  const connect = useCallback(async (conversationId: string | null) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.close(); // Close existing connection
    }
    if (!conversationId) return;
    const token = await getAccessToken();
    const url = `${CHAT_URL}?token=${token}&roomId=${conversationId}`
    ws.current = new WebSocket(url);
    ws.current.onopen = () => {
      setIsConnected(true);
      if (ws.current) 
        // @ts-ignore
        ws.current.val = conversationId;
      console.log('WebSocket connected to chat');
      reconnectAttempts.current = 0;
    };
    ws.current.onclose = (e) => {
      setIsConnected(false);
      console.log('WebSocket connected98yutfghvbto chat');
      if (e.code !== 1000 && reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        setTimeout(() => {
          reconnectAttempts.current++;
          connect(activeConversationId.current);
        }, RECONNECT_INTERVAL);
      }
    };
    ws.current.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  }, [getAccessToken]);

  const setActiveConversation = useCallback((conversationId: string | null) => {
    if (conversationId === activeConversationId.current) return; // No change
    activeConversationId.current = conversationId;
    connect(conversationId); // Close and reopen the connection with the new conversationId
  }, [connect]);

  const sendMessage = useCallback((content: string) => {
    console.log('Sending message', content);
    if (ws.current?.readyState === WebSocket.OPEN && activeConversationId.current) {
      ws.current.send(JSON.stringify({
        event: 'msg:create',
        data: { content     }
      }));
    }
  }, []);
  const updateMessage = useCallback((content: any) => {
    if (ws.current?.readyState === WebSocket.OPEN && activeConversationId.current) {
      ws.current.send(JSON.stringify({
        event: 'msg:update',
        data: content
      }));
    }
  }, []);
  const deleteMessage = useCallback((content: string) => {
    if (ws.current?.readyState === WebSocket.OPEN && activeConversationId.current) {
      ws.current.send(JSON.stringify({
        event: 'msg:delete',
        data: content
      }));
    }
  }, []);

  const readAllMessages = useCallback(() => {
    console.log('Reading all messages abeg');
    if (ws.current?.readyState === WebSocket.OPEN && activeConversationId.current) {
      console.log('Reading all messages');
      ws.current.send(JSON.stringify({
        event: 'msg:readAll',
      }));
    }
  }, []);

  useEffect(() => {
    return () => {
      ws.current?.close(); // Cleanup on unmount
    };
  }, []);

  return (
    <ChatContext.Provider value={{ 
      setActiveConversation,
      sendMessage,
      updateMessage,
      deleteMessage,
      readAllMessages,
      activeConversation: activeConversationId,
      ws,
      isConnected
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};