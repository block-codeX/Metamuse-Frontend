import { useCallback, useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { YJS_URL } from "@/lib/config";
import { useAuthStore } from "@/lib/stores/auth.store";

const useYjs = (projectId: string) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const yDocRef = useRef<Y.Doc | null>(null); // Add this ref to track the current yDoc
  const { getAccessToken } = useAuthStore();
  const isApplyingRemoteRef = useRef(false);
  // Use a ref flag to ensure initialization only happens once
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return; // Already initialized
    initializedRef.current = true;

    const initializeYjs = async () => {
      const jwtToken = await getAccessToken();

      // Create a new Yjs document first
      yDocRef.current = new Y.Doc(); // Store in ref for immediate access
      providerRef.current = new WebsocketProvider(
        YJS_URL,
        "yjs",
        yDocRef.current,
        {
          resyncInterval: 100,
          params: { token: jwtToken as string, projectId },
          connect: true,
        }
      );

      // Add event listeners
      providerRef.current.on("status", (event) => {
        console.log("WebSocket status:", event.status);
        if (event.status === "connected") {
          console.log("Reconnected, waiting for sync...");
        }
      });
      providerRef.current.on("sync", (synced: boolean) => {
          setIsInitialized(true);
        console.log("Sync status:", synced);
        console.log("Yjs initialized", yDocRef.current?.getMap("objects").size);
      });

      providerRef.current.on("connection-error", (event: any) => {
        console.error("Connection failed", event);
      });

      providerRef.current.on("connection-close", (event: any) => {
        console.error("Connection closed:", event);
      });
    };

    initializeYjs();

    return () => {
      if (providerRef.current) {
        providerRef.current.destroy();
      }
      if (yDocRef.current) {
        yDocRef.current.destroy();
      }
    };
  }, [projectId, getAccessToken]); // Run only once for a given projectId

  return {
    yDoc: yDocRef,
    provider: providerRef,
    isInitialized,
    isApplyingRemoteRef,
  };
};

interface CommandWebSocketOptions {
  onCommand?: (command: any, target: any, recipient: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const useCommandWebSocket = (
  projectId: string,
  options: CommandWebSocketOptions = {}
) => {
  const [isConnected, setIsConnected] = useState(false);
  const { getAccessToken } = useAuthStore();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Use a ref to track initialization state
  const initializedRef = useRef(false);

  // Store event handlers in refs to maintain consistent references
  const onCommandRef = useRef(options.onCommand);
  const onConnectRef = useRef(options.onConnect);
  const onDisconnectRef = useRef(options.onDisconnect);

  // Update handlers if they change
  useEffect(() => {
    onCommandRef.current = options.onCommand;
    onConnectRef.current = options.onConnect;
    onDisconnectRef.current = options.onDisconnect;
  }, [options.onCommand, options.onConnect, options.onDisconnect]);

  // Setup reconnection logic
  const reconnect = useCallback(async () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Clear any existing reconnect timer
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    try {
      const jwtToken = await getAccessToken();
      const token = `Bearer ${jwtToken}`;

      // Use the same base URL as YJS but on a different path
      const wsUrl = `${YJS_URL}?token=${jwtToken}&projectId=${projectId}&command=true`;

      console.log("Connecting to WebSocket:", wsUrl.toString());
      const ws = new WebSocket(wsUrl.toString());
      wsRef.current = ws;
      ws.onopen = () => {
        console.log("Command WebSocket connected");
        setIsConnected(true);
        if (onConnectRef.current) onConnectRef.current();
      };

      ws.onclose = (event) => {
        console.log("Command WebSocket closed:", event);
        setIsConnected(false);
        if (onDisconnectRef.current) onDisconnectRef.current();

        // Attempt to reconnect after a delay
        reconnectTimerRef.current = setTimeout(() => {
          reconnect();
        }, 2000); // 2 second reconnect delay
      };

      ws.onerror = (error) => {
        console.error("Command WebSocket error:", error);
        // The onclose handler will trigger reconnection
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Resopnse found", data)
          if (data.type === "command" && onCommandRef.current) {
            const { type, targets, recipient } = data.payload
            onCommandRef.current(type, targets, recipient);
          }
        } catch (err) {
          console.error("Error parsing command message:", err);
        }
      };
    } catch (err) {
      console.error("Failed to initialize command WebSocket:", err);
      // Attempt to reconnect after a delay
      reconnectTimerRef.current = setTimeout(() => {
        reconnect();
      }, 5000); // 5 second reconnect delay on error
    }
  }, [projectId, getAccessToken]);

  // Send a command to the server
  const sendCommand = useCallback((commandType: string, payload: any) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("Cannot send command: WebSocket not connected");
      return false;
    }

    try {
      console.log("about to send a new command")
      wsRef.current.send(
        JSON.stringify({
          type: "command",
          command: commandType,
          payload,
        })
      );
      return true;
    } catch (err) {
      console.error("Error sending command:", err);
      return false;
    }
  }, []);

  // Initialize the WebSocket connection
  useEffect(() => {
    if (initializedRef.current) return; // Prevent multiple initializations
    initializedRef.current = true;

    reconnect();

    // Cleanup function
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      initializedRef.current = false;
    };
  }, [projectId, reconnect]);

  return {
    isConnected,
    sendCommand,
    reconnect,
  };
};

export default useYjs;
