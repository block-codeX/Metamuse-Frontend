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
import {
  api,
  getInitials,
  getRandomComplementaryColors,
  humanizeDate,
} from "@/lib/utils";
import { ArrowLeft, MessageSquare, SendHorizonal, X } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@/app/auth/context/chat-context";
import handleMessageFromServer from "@/app/auth/context/handlers";
import { toast } from "sonner";
import { useProject } from "./project-context";
import { Message, MessageItem } from "./collaborator";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Sample conversations for the list view
const sampleConversations = [
  {
    id: "conv1",
    name: "Project Alpha",
    firstName: "John",
    lastName: "Mary",
    lastMessage: "Let's review the design changes",
    timestamp: "2h ago",
    unread: 3,
  },
  {
    id: "conv2",
    name: "Marketing Campaign",
    lastMessage: "I've updated the copy as requested",
    timestamp: "Yesterday",
    unread: 0,
    firstName: "John",
    lastName: "Mary",
  },
  {
    id: "conv3",
    name: "Website Redesign",
    lastMessage: "The new mockups are ready for review",
    timestamp: "2d ago",
    unread: 0,
    firstName: "John",
    lastName: "Mary",
  },
  {
    id: "conv4",
    name: "Bug Fixes",
    lastMessage: "All critical issues have been resolved",
    timestamp: "3d ago",
    unread: 5,
    firstName: "John",
    lastName: "Mary",
  },
  {
    id: "conv5",
    name: "Team Standup",
    lastMessage: "Let's discuss progress on the new features",
    timestamp: "4d ago",
    unread: 0,
    firstName: "John",
    lastName: "Mary",
  },
];

// Conversation list item component
const ConversationItem = ({ conversation, onClick }) => {
  const [bgColor, textColor] = getRandomComplementaryColors(conversation.name);
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center p-3 rounded-md hover:bg-accent cursor-pointer"
      onClick={() => onClick(conversation.id)}
    >
      <Avatar className="h-10 w-10 mr-3">
        <AvatarFallback 
          style={{ backgroundColor: bgColor, color: textColor }}
        >
          {getInitials(conversation.firstName, conversation.lastName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <h4 className="text-sm font-medium truncate">{conversation.firstName}{" "}{conversation.lastName}</h4>
          <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{conversation.lastMessage}</p>
      </div>
      {conversation.unread > 0 && (
        <div className="ml-2 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
          {conversation.unread}
        </div>
      )}
    </motion.div>
  );
};

export default function ChatComponent() {
  // State for chat visibility and view
  const { project } = useProject();
  const [messages, setMessages] = useState<Message[]>([]);
  const [nextPage, setNextPage] = useState(null);
  const [content, setContent] = useState("");
  const [toUpdate, setToUpdate] = useState("");
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [showConversationList, setShowConversationList] = useState(!pathname?.includes("/projects/"));
  const isCanvasPage = pathname?.includes("/canvas");
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

  const selectConversation = (conversationId) => {
    // In a real implementation, you would set the active conversation here
    // For now, we'll just switch to the messages view
    setShowConversationList(false);
    // Mock setting the conversation
    console.log(`Selected conversation: ${conversationId}`);
  };

  const goToConversationList = () => {
    setShowConversationList(true);
  };

  // Chat button animation variants
  const chatButtonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  // Chat panel animation variants
  const chatPanelVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        duration: 0.3
      }
    },
    exit: { 
      opacity: 0, 
      y: 20, 
      scale: 0.9,
      transition: { 
        duration: 0.2 
      }
    }
  };

  // View transition variants
  const viewTransitionVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    })
  };

  // If chat is not visible, just show the toggle button
  if (!isVisible) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={chatButtonVariants}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed right-16 bottom-16"
      >
        <Button
          onClick={toggleChat}
          className="rounded-full w-12 h-12 flex items-center cursor-pointer justify-center shadow-lg bg-primary text-primary-foreground"
          aria-label="Open chat"
        >
          <MessageSquare size={24} />
        </Button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        key="chat-panel"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={chatPanelVariants}
        className="fixed bottom-4 right-4 z-50 w-80 h-120 shadow-lg"
      >
        <Card className="px-2 h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center">
              {!showConversationList && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToConversationList}
                  className="mr-2 h-8 w-8"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft size={18} />
                </Button>
              )}
              <h2 className="text-xl font-semibold">
                {showConversationList ? "Conversations" : "Messages"}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleChat}
              className="h-8 w-8"
              aria-label="Close chat"
            >
              <X size={18} />
            </Button>
          </CardHeader>
          <CardContent
            className="p-0 overflow-y-auto"
            style={{ height: "calc(100% - 140px)" }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={showConversationList ? "list" : "messages"}
                custom={showConversationList ? 1 : -1}
                variants={viewTransitionVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="h-full"
              >
                {showConversationList ? (
                  <div className="space-y-1 p-2">
                    {sampleConversations.map((conversation) => (
                      <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        onClick={selectConversation}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 p-1">
                    {messages.map((message) => (
                      <MessageItem
                        key={message._id}
                        message={message}
                        sender={message.sender}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
          <CardFooter className="border-t p-4">
            {!showConversationList && (
              <div className="relative w-full items-center space-x-2">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="resize-none bottom-0 rounded-md border border-btn-primary bg-background px-3 py-2 text-sm ring-offset-background pr-14"
                ></Textarea>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute right-2 bottom-2"
                >
                  <Button
                    variant={"outline"}
                    onClick={sendToServer}
                    className="rounded-md text-btn-primary border-btn-primary"
                  >
                    <SendHorizonal strokeWidth={1.5} />
                  </Button>
                </motion.div>
              </div>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}