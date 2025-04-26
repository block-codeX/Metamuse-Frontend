"use client";
import { motion } from "framer-motion";
import React, { ReactNode, useState } from "react";
import { ChatProvider } from "../auth/context/chat-context";
import { UserProvider } from "../auth/context/user-context";
import MySidebar from "./sidebar";

interface ContentProps {
  children: ReactNode;
}

const Content: React.FC<ContentProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Function to be passed to sidebar to update parent state
  const handleSidebarToggle = (collapsed: any) => {
    setIsSidebarCollapsed(collapsed);
  };
  return (
    <UserProvider>
      <ChatProvider>
        <div className="flex flex-row items-center justify-between gap-0 h-screen w-screen dark:bg-gray-900 overflow-hidden p-0 m-0">
          {/* Sidebar */}
          <MySidebar onToggle={handleSidebarToggle} />

          {/* Main Content */}
          <motion.main
            className={`overflow-auto p-0 dark:bg-gray-900 w-full`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="w-full h-full p-0">{children}</div>
          </motion.main>
        </div>
      </ChatProvider>
    </UserProvider>
  );
};

export default Content;
