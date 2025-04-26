"use client";
import ChatComponent from "./studio/[projectId]/components/chat-component";
import { ProjectProvider } from "./studio/[projectId]/components/project-context";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // State for dropdown visibility

  return (
    <ProjectProvider>
        <div className="flex flex-col items-center justify-center h-screen w-full bg-background">
          <div className="flex flex-col justify-start items-start w-full bg-background overflow-scroll">
            {children}
          </div>
          <ChatComponent />
        </div>
    </ProjectProvider>
  );
}
