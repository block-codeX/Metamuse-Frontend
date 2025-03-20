import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";
import { WebsocketProvider } from "y-websocket";
import { YJS_URL } from "@/lib/config";
import { useAuthStore } from "@/lib/stores/auth.store";

const useYjs = (projectId: string) => {
  const [project, setProject] = useState<any>(null);
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
      const token = `Bearer ${jwtToken}`;

      // Create a new Yjs document first
      yDocRef.current = new Y.Doc(); // Store in ref for immediate access
      providerRef.current = new WebsocketProvider(
        YJS_URL,
        "",
        yDocRef.current,
        {
          params: { token: jwtToken as string, projectId },
          connect: true
        }
      );

      // Add event listeners
      providerRef.current.on('status', (event) => {
        console.log('WebSocket status:', event.status);
        if (event.status === 'connected') {
          console.log('Reconnected, waiting for sync...');
        }
      });
      providerRef.current.on("sync", (synced: boolean) => {
        console.log("Sync status:", synced);
        console.log("Yjs initialized", yDocRef.current?.getMap('objects').size);
        setIsInitialized(true);
      });

      providerRef.current.on("connection-error", (event: any) => {
        console.error("Connection failed", event)
      })

      providerRef.current.on("connection-close", (event: any) => {
        console.error("Connection closed:", event);
      });
      console.log("Yjs initialized", providerRef.current);
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
    project,
    isInitialized,
    isApplyingRemoteRef,
  };
};

export default useYjs;
