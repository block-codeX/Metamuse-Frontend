"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, getInitials, humanizeDate, reconstructImg } from "@/lib/utils";
import { useProject } from "./components/project-context";
import {
  Brush,
  Calendar,
  Clock5,
  Edit,
  Plus,
  Send,
  SendHorizonal,
} from "lucide-react";
import * as fabric from "fabric";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "sonner";
import AddUserModal from "./components/add-collab";
import { CollaboratorItem } from "./components/collaborator";
// Types

// Helper to get initials from name

export default function ProjectView() {
  const { project } = useProject();
  const [showAddUser, setShowAddUser] = useState(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const router = useRouter();
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
    loadImg();
  }, [project]);

  return (
    <div className=" max-w-[calc(100%-350px)] w-[90%] h-full">
      <Card className="w-full h-full  space-y-2 gap-1">
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
                        {project.creator.firstName} {project.creator.lastName}
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
                            <h4 className="text-sm font-medium">Created by</h4>
                            <p className="text-sm text-muted-foreground">
                              {project.creator.firstName}{" "}
                              {project.creator.lastName}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Status</h4>
                            <p className="text-sm text-muted-foreground">
                              {project.completed ? "Completed" : "In Progress"}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Categories</h4>
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
                        <CardHeader className="pb-3 flex flex-row justify-between items-center">
                          <h3 className="text-lg font-medium">Collaborators</h3>
                          <Button onClick={() => setShowAddUser(true)}>
                            <Plus />
                          </Button>
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
      <AddUserModal
        projectId={project?._id}
        isOpen={showAddUser}
        onClose={() => setShowAddUser(false)}
      />
      <Toaster />{" "}
      </div>
  );
}
