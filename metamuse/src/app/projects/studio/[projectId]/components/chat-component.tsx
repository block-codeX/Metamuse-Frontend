"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { api, getInitials, getRandomComplementaryColors, humanizeDate } from "@/lib/utils";
import { MessageSquare, SendHorizonal, X } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@/app/auth/context/chat-context";
import handleMessageFromServer from "@/app/auth/context/handlers";
import { toast } from "sonner";
import { useProject } from "./project-context";
import { Message, MessageItem } from "./collaborator";
import { usePathname } from "next/navigation";

// Collaborator component


export default function ChatComponent() {
  // State for dropdown visibility
  const { project } = useProject();
  const [messages, setMessages] = useState<Message[]>([]);
  const [nextPage, setNextPage] = useState(null);
  const [content, setContent] = useState("");
  const [toUpdate, setToUpdate] = useState("");
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const isCanvasPage = pathname?.includes('/canvas');
  const {
    setActiveConversation,
    sendMessage,
    updateMessage,
    deleteMessage,
    isConnected,
    ws,
  } = useChat();
  const fetchMessages = async () => {
    if (!project) return;
    const response = await api(true).get(
      `/conversations/${project?.conversation}/messages?full=true`
    );
    if (response.status === 200) {
      console.log(response.data);
      const { docs, next, page, totalDocs } = response.data;
      setMessages(docs);
      setNextPage(next);
    }
  };

  const sendToServer = () => {
    console.log("Got here", content);
    sendMessage(content);
    setContent("");
  };
  const handleKeyDown = useCallback(
    (e) => {
      // Send message on Ctrl+Enter or Cmd+Enter
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        sendToServer();
      }
    },
    [sendToServer]
  );
  const updateToServer = () => {
    const data = { content, id: toUpdate };
    updateMessage(data);
    setContent("");
    setToUpdate("");
  };
  const deleteFromServer = () => {
    deleteMessage({ id: toUpdate });
    setContent("");
    setToUpdate("");
  };
  useEffect(() => {
    if (!project) return;
    setActiveConversation(project.conversation);
    fetchMessages();
  }, [project]);
  useEffect(() => {
    if (!project) return;
    setActiveConversation(project.conversation);
    const handleMessages = ({ data }) => {
       handleMessageFromServer(data, setMessages, toast);
    };
    if (isConnected && ws.current?.val == project.conversation)
      ws.current.addEventListener("message", handleMessages);
    return () => {
      ws.current?.removeEventListener("message", handleMessages);
      // ws.current?.close();
    };
  }, [project, isConnected]);
  const toggleChat = () => {
    setIsVisible(!isVisible);
  };
  
  // If on canvas page and chat is not visible, just show the toggle button
  if (isCanvasPage && !isVisible) {
    return (
      <Button
        onClick={toggleChat}
        className="fixed right-16 bottom-16 rounded-full w-12 h-12 flex items-center justify-center shadow-lg bg-primary text-primary-foreground"
        aria-label="Open chat"
      >
        <MessageSquare size={24} />
      </Button>
    );
  }
  const containerClassName = isCanvasPage
  ? "fixed bottom-4 right-4 z-50 w-80 h-96 shadow-lg"
  : "self-stretch max-w-[300px] w-full";
//   const canvasStyle = isCanvas ? ""
  return (
<div className={containerClassName}>
      <Card className="px-2 h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-semibold">Messages</h2>
          {isCanvasPage && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleChat}
              className="h-8 w-8"
              aria-label="Close chat"
            >
              <X size={18} />
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0 overflow-y-auto" style={{ height: 'calc(100% - 140px)' }}>
          <div className="space-y-4 p-1">
            {messages.map((message) => {
              return (
                <MessageItem
                  key={message._id}
                  message={message}
                  sender={message.sender}
                />
              );
            })}
          </div>
        </CardContent>
        <CardFooter className="border-t p-4">
          <div className="relative w-full items-center space-x-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="resize-none bottom-0 rounded-md border border-btn-primary bg-background px-3 py-2 text-sm ring-offset-background pr-14"
            ></Textarea>
            <Button
              variant={"outline"}
              onClick={sendToServer}
              className="absolute right-2 bottom-2 rounded-md text-btn-primary border-btn-primary"
            >
              <SendHorizonal strokeWidth={1.5} />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
