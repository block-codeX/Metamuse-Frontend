import React from 'react';
import Image from 'next/image';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types
interface Collaborator {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
  creator: Collaborator;
  collaborators: Collaborator[];
  completed: boolean;
  messages: Message[];
}

// Helper to get initials from name
const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`;
};

// Message component
const MessageItem = ({ message, sender }: { message: Message, sender: Collaborator }) => {
  return (
    <div className="flex items-start space-x-3 mb-4">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
          {getInitials(sender.firstName, sender.lastName)}
        </AvatarFallback>
      </Avatar>
      <div>
        <div className="flex items-center gap-2">
          <p className="font-medium">{sender.firstName} {sender.lastName}</p>
          <span className="text-xs text-muted-foreground">{new Date(message.timestamp).toLocaleString()}</span>
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
        <p className="font-medium text-sm">{collaborator.firstName} {collaborator.lastName}</p>
        <p className="text-xs text-muted-foreground">{collaborator.email}</p>
      </div>
    </div>
  );
};

export default function ProjectView({ project }: { project: Project }) {
  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Project Main Content */}
        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold">{project.title}</h1>
                  <div className="flex items-center mt-2">
                    <Badge variant={project.completed ? "default" : "outline"} className="mr-2">
                      {project.completed ? "Completed" : "In Progress"}
                    </Badge>
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="mr-2">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end">
                    <Avatar className="h-10 w-10 mr-2">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(project.creator.firstName, project.creator.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{project.creator.firstName} {project.creator.lastName}</p>
                      <p className="text-xs text-muted-foreground">{project.creator.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video w-full overflow-hidden rounded-md mb-4">
                <Image 
                  src={project.imageUrl} 
                  alt={project.title} 
                  fill 
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <p className="text-muted-foreground">{project.description}</p>
            </CardContent>
          </Card>

          {/* Conversations */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Conversations</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto p-1">
                {project.messages.map((message) => {
                  const sender = project.collaborators.find(c => c.id === message.senderId) || project.creator;
                  return <MessageItem key={message.id} message={message} sender={sender} />;
                })}
              </div>
            </CardContent>
            <CardFooter className="border-t p-4">
              <div className="flex w-full items-center space-x-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                />
                <button className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                  Send
                </button>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1">
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-4">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium">Project Details</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium">Created by</h4>
                    <p className="text-sm text-muted-foreground">
                      {project.creator.firstName} {project.creator.lastName}
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
                <CardHeader className="pb-3">
                  <h3 className="text-lg font-medium">Collaborators</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[project.creator, ...project.collaborators].map((collaborator) => (
                      <CollaboratorItem key={collaborator.id} collaborator={collaborator} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}