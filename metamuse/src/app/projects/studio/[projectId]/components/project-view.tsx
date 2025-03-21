"use client";
import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  api,
  getInitials,
  getRandomComplementaryColors,
  humanizeDate,
  reconstructImg,
} from "@/lib/utils";
import { useProject } from "./project-context";
import {
  Brush,
  Calendar,
  Clock5,
  Edit,
  Send,
  SendHorizonal,
} from "lucide-react";
import * as fabric from "fabric";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useChat } from "@/app/auth/context/chat-context";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import handleMessageFromServer from "@/app/auth/context/handlers";
import { toast } from "sonner";
// Types
interface Collaborator {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Message {
  id: string;
  sender: Collaborator
  content: string;
  createdAt: string;
  updatedAt: string;
}
// Helper to get initials from name
const messages = [
  {
    id: "m1",
    senderId: "c1",
    content:
      "I've started working on the central composition. What do you think about using a warmer palette for the buildings?",
    timestamp: "2025-03-15T14:30:00",
  },
  {
    id: "m2",
    senderId: "c2",
    content:
      "That works! I can focus on the foreground elements with complementary cooler tones.",
    timestamp: "2025-03-15T15:45:00",
  },
  {
    id: "m3",
    senderId: "c3",
    content:
      "I've uploaded some reference photos that might help with the perspective on the right side.",
    timestamp: "2025-03-16T09:20:00",
  },
  {
    id: "m4",
    senderId: "c1",
    content: "Perfect! Let's sync up tomorrow to discuss the final touches.",
    timestamp: "2025-03-16T10:15:00",
  },
];
// Message component
const MessageItem = ({
  message,
  sender,
}: {
  message: Message;
  sender: Collaborator;
}) => {
  const colors = getRandomComplementaryColors();
  return (
    <div className="flex items-start space-x-3 mb-4">
      <Avatar className="h-8 w-8">
        <AvatarFallback
          className="bg-primary text-primary-foreground text-xs"
          style={{
            backgroundColor: colors[0].background,
            color: colors[0].text,
          }}
        >
          {getInitials(sender.firstName, sender.lastName)}
        </AvatarFallback>
      </Avatar>
      <div>
        <div className="flex items-center gap-2">
          <p className="font-medium">
            {sender.firstName} {sender.lastName}
          </p>
          <span className="text-xs text-muted-foreground">
            {humanizeDate(message.createdAt)}
          </span>
        </div>
        <p className="text-sm mt-1">{message.content}</p>
      </div>
    </div>
  );
};

// Collaborator component
const CollaboratorItem = ({ collaborator }: { collaborator: Collaborator }) => {
  return (
    <div className="flex items-center space-x-3 mb-2">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
          {getInitials(collaborator.firstName, collaborator.lastName)}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium text-sm">
          {collaborator.firstName} {collaborator.lastName}
        </p>
        <p className="text-xs text-muted-foreground">{collaborator.email}</p>
      </div>
    </div>
  );
};

export default function ProjectView() {
  const { project } = useProject();
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [toUpdate, setToUpdate] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<any>(null);
  const [nextPage, setNextPage] = useState(null);
  const router = useRouter();
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
    console.log("Got here", content)
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
  const toCanvas = () => {
    router.push(`${project?._id}/canvas`);
  };
  const loadImg = async () => {
    const canvasEl = document.createElement("canvas");
    document.body.appendChild(canvasEl);
    if (!project) {
      setImgUrl(null);
      return;
    }

    // Initialize Fabric.js on your canvas element
    const fabricCanvas = new fabric.Canvas(canvasEl, {
      width: window.innerWidth - 100,
      height: window.innerHeight,
      backgroundColor: "#ffffff",
    });
    // fabricCanvas.loadFromJSON
    try {
      const url = await reconstructImg(fabricCanvas, project._id);
      setImgUrl(url);
      console.log("New url", url);
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      // Remove the temporary canvas element if it's still attached
      if (canvasEl.parentNode) {
        canvasEl.parentNode.removeChild(canvasEl);
      }
    }
  };
  useEffect(() => {
    if (!project) return;
    setActiveConversation(project.conversation);
    fetchMessages();
    loadImg();
  }, [project]);
  useEffect(() => {
    if (!project) return;
    setActiveConversation(project.conversation);
    const handleMessages = ({ data }) => {
      handleMessageFromServer(data, setMessages, toast);
      console.log("Received message:", data);
    };
    if (isConnected && ws.current?.val == project.conversation)
      ws.current.addEventListener("message", handleMessages);
    return () => {
      ws.current?.removeEventListener("message", handleMessages);
      // ws.current?.close();
    };
  }, [project, isConnected]);

  return (
    <div className="mx-auto py-6 h-full fixed bottom-0 w-screen">
      <div className="flex flex-row h-full flex-wrap gap-6 px-5">
        {/* Project Main Content */}
        <div className="max-w-[calc(100%-350px)] w-full">
          <Card className="w-[100vw] max-w-full h-full mb-6 space-y-2 gap-1">
            {project ? (
              <>
                <CardHeader className="m-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-2xl font-bold">{project.title}</h1>
                      <div className="flex items-center mt-2">
                        <Badge
                          variant={project.completed ? "default" : "outline"}
                          className="mr-2"
                        >
                          {project.completed ? "Completed" : "In Progress"}
                        </Badge>
                        {project.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="mr-2">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right flex flex-col justify-start items-start space-y-4">
                      <div className="flex items-center justify-end">
                        <Avatar className="h-10 w-10 mr-2">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(
                              project.creator.firstName,
                              project.creator.lastName
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {project.creator.firstName}{" "}
                            {project.creator.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {project.creator.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={toCanvas}
                        variant={"outline"}
                        className="self-end flex flex-row active:scale-95 transition-scale cursor-pointer items-center justify-start space-y-3"
                      >
                        {" "}
                        <Brush size={24} /> Join
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="m-0">
                  <div className="flex flex-row items-stretch h-90">
                    <div className="mr-5 border border-red-500 relative aspect-video w-full overflow-hidden justify-start rounded-md mb-4">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={project.title}
                          fill="true"
                          // fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <Skeleton className="w-full h-full"></Skeleton>
                      )}
                    </div>
                    <div className="">
                      <Tabs defaultValue="details" className="w-60">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="details">Details</TabsTrigger>
                          <TabsTrigger value="collaborators">
                            Collaborators
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="details" className="mt-4">
                          <Card>
                            <CardHeader>
                              <h3 className="text-lg font-medium">
                                Project Details
                              </h3>
                              <div className="flex flex-row flex-wrap items-center space-x-3 space-y-1 justify-start">
                                <span className="text-[12px] flex flex-row gap-1 items-center">
                                  <Calendar size={16} strokeWidth={1} />{" "}
                                  {humanizeDate(project.createdAt)}
                                </span>
                                <span className="text-[12px] flex flex-row gap-1 items-center">
                                  <Clock5 size={16} strokeWidth={1} />{" "}
                                  {humanizeDate(project.updatedAt)}
                                </span>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <h4 className="text-sm font-medium">
                                  Created by
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {project.creator.firstName}{" "}
                                  {project.creator.lastName}
                                </p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">Status</h4>
                                <p className="text-sm text-muted-foreground">
                                  {project.completed
                                    ? "Completed"
                                    : "In Progress"}
                                </p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">
                                  Categories
                                </h4>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {project.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                        <TabsContent value="collaborators" className="mt-4">
                          <Card>
                            <CardHeader className="pb-3">
                              <h3 className="text-lg font-medium">
                                Collaborators
                              </h3>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {project.collaborators.map((collaborator) => (
                                  <CollaboratorItem
                                    key={collaborator._id}
                                    collaborator={collaborator}
                                  />
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>

                  <p className="text-muted-foreground">{project.description}</p>
                </CardContent>
              </>
            ) : (
              <div className="grid grid-rows-[60px_2fr_60px] grid-cols-[3fr_1fr] gap-4 m-4">
                <Skeleton className="row-start-1 col-start-1 col-span-2 h-[60px] "></Skeleton>
                <Skeleton className="col-start-2 row-start-2 row-span-2 h-full w-full"></Skeleton>
                <Skeleton className="col-start-1 row-start-2 w-full max-h-[300px] h-100"></Skeleton>
                <Skeleton className="col-start-1 row-start-3 w-[70%] h-[60px]"></Skeleton>
              </div>
            )}
          </Card>
        </div>
        {/* Conversations */}
        <div className="self-stretch max-w-[300px] w-full h-auto ">
          <Card className="px-2">
            <CardHeader>
              <h2 className="text-xl font-semibold">Messages</h2>
            </CardHeader>
            <CardContent className="h-90 p-0 ">
              <div className="space-y-4  overflow-y-auto h-95 p-1">
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
                  className=" absolute right-2 bottom-2 rounded-md text-btn-primary border-btn-primary"
                >
                  <SendHorizonal strokeWidth={1.5} />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
        {/* Sidebar */}
      </div>
    </div>
  );
}
