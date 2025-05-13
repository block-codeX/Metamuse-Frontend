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
import { api, getColorsFromId, getInitials, humanizeDate } from "@/lib/utils";
import {
  ArrowLeft,
  MessageSquare,
  SendHorizonal,
  UserPlus,
  X,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback, FC } from "react";
import { useChat } from "@/app/auth/context/chat-context";
import handleMessageFromServer from "@/app/auth/context/handlers";
import { toast } from "sonner";
import { useProject } from "./project-context";
import { Message, MessageItem } from "./collaborator";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WaveDots } from "@/components/ui/pulse-loader";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/lib/stores/user-store";

// Conversation list item component
const ConversationItem: FC = ({ conversation, onClick }) => {
  const { background, text } = getColorsFromId(conversation._id);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center p-3 rounded-md hover:bg-accent cursor-pointer"
      onClick={() => onClick(conversation.id)}
    >
      <Avatar className="h-10 w-10 mr-3">
        <AvatarFallback style={{ backgroundColor: background, color: text }}>
          {getInitials(conversation.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <h4 className="text-sm font-medium truncate">{conversation.name}</h4>
          <span className="text-xs text-muted-foreground">
            {humanizeDate(conversation.updatedAt)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {conversation.lastMessage?.content}
        </p>
      </div>
      {conversation.unreadCount > 0 && (
        <div className="ml-2 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
          {conversation.unreadCount}
        </div>
      )}
    </motion.div>
  );
};

export default function ChatComponent() {
  // State for chat visibility and view
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [myConversations, setMyConversations] = useState<any[]>([]);
  const [nextMessagesPage, setNextMessagesPage] = useState(null);
  const [content, setContent] = useState("");
  const [toUpdate, setToUpdate] = useState("");
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [activeConv, setActiveConv] = useState("");
  const [nextConvPage, setNextConvPage] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState("");
  const [nextUserPage, setNextUserPage] = useState(null);
  const { user: currentUser } = useUserStore();
  const [showConversationList, setShowConversationList] = useState("convo");
  const {
    setActiveConversation,
    sendMessage,
    updateMessage,
    deleteMessage,
    readAllMessages,
    isConnected,
    activeConversation,
    ws,
  } = useChat();

  const fetchMessages = async () => {
    if (!activeConversation.current) return;
    const response = await api(true).get(
      `/conversations/${activeConversation.current}/messages?full=true`
    );
    if (response.status === 200) {
      console.log(response.data);
      const { docs, next, page, totalDocs } = response.data;
      setMessages(docs);
      setNextMessagesPage(next);
    }
  };
  const fetchConversations = async () => {
    const response = await api(true).get(`/conversations`);
    if (response.status === 200) {
      console.log("Responded", response.data);
      const { docs, next, page, totalDocs } = response.data;
      setMyConversations(docs);
      setNextConvPage(next);
    }
  };
  const fetchUsers = async (query = "") => {
    try {
      let url = "/users/all";
      if (query.trim()) url += `?name=${query}`;
      const response = await api(true).get(url);
      if (response.status === 200) {
        const { docs, next, page } = response.data;
        console.log(docs, "ADDD");
        setUsers(docs);
        setNextUserPage(next);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const sendToServer = () => {
    sendMessage(content);
    setContent("");
  };

  const handleKeyDown = useCallback(
    (e) => {
      // Send message on Ctrl+Enter or Cmd+Enter
      if (e.key === "Enter" && !e.shiftKey) {
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
    fetchConversations();
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleMessages = ({ data }) => {
      handleMessageFromServer(data, setMessages, toast);
    };
    if (isConnected && ws.current?.val)
      ws.current.addEventListener("message", handleMessages);
    return () => {
      ws.current?.removeEventListener("message", handleMessages);
    };
  }, [isConnected]);

  const toggleChat = () => {
    setIsVisible(!isVisible);
  };

  const selectConversation = (conversationId: any, convName: string) => {
    setShowConversationList("messages");
    setActiveConversation(conversationId);
    setActiveConv(convName);
    setContent("");
  };

  // Add a useEffect to fetch messages when activeConversation changes
  // Update your existing useEffect
  useEffect(() => {
    if (activeConversation.current) {
      if (showConversationList == "messages") fetchMessages();
      if (showConversationList == "users") fetchUsers;

      // Only call readAllMessages if the connection is established
      if (isConnected) {
        readAllMessages();
      }
    }
  }, [activeConversation.current, isConnected, showConversationList]); // Add isConnected as a dependency
  const goToConversationList = () => {
    setShowConversationList("convo");
  };
  const handleSearch = async (e: any) => {
    const query = e.target.value;
    setSearch(query);
    await fetchUsers(query);
  };

  const handleConverse = async (second: string) => {
    setLoading(second);
    try {
      const response = await api(true).post("/conversations/converse", {
        second,
      });
      if (response.status == 200) {
        console.log(response.data);
        const conversation = response.data
        setShowConversationList("messages");
        setActiveConversation(conversation._id);
        setActiveConv(conversation.name);
        setContent("");
        setSearch("")
      }
    } catch {
      toast.error("Something went wrong. Please try again later");
    } finally {
      setLoading("");
    }
  };
  // Chat button animation variants
  const chatButtonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
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
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.9,
      transition: {
        duration: 0.2,
      },
    },
  };

  // View transition variants
  const viewTransitionVariants = {
    enter: (direction: any) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: (direction: any) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    }),
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
        className="fixed right-16 bottom-16  z-80"
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
        className="fixed bottom-4 right-4 z-80 w-80 h-120 shadow-lg"
      >
        <Card className="px-2 h-full w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center">
              {showConversationList != "convo" && (
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
              <h2 className="text-xl font-semibold flex flex-row items-center justify-start gap-4">
                {showConversationList == "convo" && (
                  <UserPlus
                    size={24}
                    strokeWidth={2}
                    color="var(--btn-primary)"
                    onClick={() => setShowConversationList("users")}
                    className=" h-full w-full p-2 hover:bg-background rounded-md cursor-pointer hover:bg-accent active:scale-95 transition-all duration-300"
                  />
                )}
                {showConversationList == "convo"
                  ? "Conversations"
                  : showConversationList == "users"
                  ? "Artists"
                  : activeConv}
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
            className="p-0 overflow-y-auto w-full"
            style={{ height: "calc(100% - 140px)" }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={
                  showConversationList == "convo"
                    ? "list"
                    : showConversationList == "users"
                    ? "users"
                    : "messages"
                }
                custom={showConversationList ? 1 : -1}
                variants={viewTransitionVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="h-full w-full"
              >
                {showConversationList == "convo" && (
                  <div className="space-y-1 p-2">
                    {myConversations.map((conversation) => (
                      <ConversationItem
                        key={conversation._id}
                        conversation={conversation}
                        onClick={() =>
                          selectConversation(
                            conversation._id,
                            conversation.name
                          )
                        }
                      />
                    ))}
                  </div>
                )}
                {showConversationList == "messages" && (
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
                {showConversationList == "users" && (
                  <div className="h-full space-y-4 p-1 overflow-x-hidden overflow-y-auto border-red-500">
                    <Input
                      placeholder="Search users..."
                      value={search}
                      onChange={handleSearch}
                      className="w-full sticky top-0  "
                    />
                    {users.map(
                      (user) =>
                        user._id != currentUser?._id && (
                          <Button
                            key={user._id}
                            variant="ghost"
                            className="w-75 justify-start"
                            onClick={() => handleConverse(user._id)}
                          >
                            {user.firstName} {user.lastName}
                            <span className="text-xs text-gray-500 ml-2 grow flex flex-row items-center justify-between">
                              {user.email}
                              {loading == user._id && <WaveDots />}
                            </span>
                          </Button>
                        )
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
          <CardFooter className="border-t p-4">
            {showConversationList == "messages" && (
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
