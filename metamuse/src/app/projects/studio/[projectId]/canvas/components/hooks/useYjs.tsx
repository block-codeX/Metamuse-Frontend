import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";
import { WebsocketProvider } from "y-websocket";
import { YJS_URL } from "@/lib/config";
import { useAuthStore } from "@/lib/stores/auth.store";

const useYjs = (projectId: string) => {
  const [project, setProject] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const providerRef = useRef<SocketIOProvider | null>(null);
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
        "ws://localhost:8001", // Test with localhost first
        projectId,
        yDocRef.current,
        {
          connect: true,
        }
      );

      // Add event listeners
      providerRef.current.on("status", (event: any) => {
        console.log("Connection status:", event.status); // Should show "connecting" -> "connected"
      });

      providerRef.current.on("sync", (synced: boolean) => {
        console.log("Sync status:", synced);
      });

      providerRef.current.on("connection-close", (event: any) => {
        console.error("Connection closed:", event);
      });

      // Manually initiate connection

      // providerRef.current.connect();

      console.log("Yjs initialized", providerRef.current);
      setIsInitialized(true);
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
    isApplyingRemoteRef
  };
};

export default useYjs;
