import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";
import { WebsocketProvider } from "y-websocket";
import { YJS_URL } from "@/lib/config";
import { useAuthStore } from "@/lib/stores/auth.store";

const useChat = () => {
  const [convDetails, setConvDetails] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const { getAccessToken } = useAuthStore();
  // Use a ref flag to ensure initialization only happens once

  useEffect(() => {

    return () => {
    };
  }, [convId]); // Run only once for a given projectId

  return {
  };
};

export default useChat;
