"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Brush, CircleUser, Ghost, User } from "lucide-react";
import { useUserStore } from "@/lib/stores/user-store";
import ChatComponent from "./studio/[projectId]/components/chat-component";
import { ProjectProvider } from "./studio/[projectId]/components/project-context";
  import { AnimatePresence, motion } from "framer-motion";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // State for dropdown visibility
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showBrushDropdown, setShowBrushDropdown] = useState(false);
  const [showConversationDropdown, setShowConversationDropdown] =
    useState(false);
  const [isMarketplace, setIsMarketplace] = useState(false);
  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      y: -5,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  };

  const listItemVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: (i: any) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.2,
      },
    }),
  };
  const { user } = useUserStore();
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMarketplace(
        window.location.pathname.startsWith("/projects/marketplace")
      );
    }
  }, []);

  const goToStudio = () => {
    window.location.href = isMarketplace
      ? "/projects/studio"
      : "/projects/marketplace";
  };
  // Refs for handling clicks outside dropdowns
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const brushDropdownRef = useRef<HTMLDivElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);

  // Click outside handler to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
      if (
        brushDropdownRef.current &&
        !brushDropdownRef.current.contains(event.target as Node)
      ) {
        setShowBrushDropdown(false);
      }
      if (
        conversationRef.current &&
        !conversationRef.current.contains(event.target as Node) &&
        !showConversationDropdown
      ) {
        setShowConversationDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showConversationDropdown]);

  return (
    <ProjectProvider>
        <div className="flex flex-col items-center justify-center h-screen bg-background">
          <header className="fixed top-0 h-[60px] w-full border-b border-gray-200 flex flex-row justify-between items-center px-4 bg-background z-10">
            <div className="flex flex-row space-x-4">
              {/* Brush button with dropdown */}
              <div className="relative" ref={brushDropdownRef}>
                <Button variant={"ghost"} className="cursor-pointer">
                  <Brush />
                </Button>
              </div>

              <Button
                className="rounded-[40px] cursor-pointer bg-btn-primary dark:bg-btn-primary"
                onClick={goToStudio}
              >
                {isMarketplace ? "Studio" : "Marketplace"}
              </Button>

              {/* <Button variant={"outline"} className="rounded-[40px] cursor-pointer">
            Studio
          </Button> */}
            </div>

            <div
              className="flex flex-row space-x-4 justify-end items-center"
              ref={conversationRef}
            >
              <div className="relative" ref={userDropdownRef}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                  >
                    <User />
                  </Button>
                </motion.div>

                {/* User dropdown content with AnimatePresence for exit animations */}
                <AnimatePresence>
                  {showUserDropdown && (
                    <motion.div
                      className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg p-4 border border-gray-200 dark:border-gray-700 z-50"
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={dropdownVariants}
                    >
                      <motion.div
                        className="flex items-center space-x-3 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700"
                        variants={listItemVariants}
                        custom={0}
                        initial="hidden"
                        animate="visible"
                      >
                        <CircleUser className="h-10 w-10" strokeWidth={1} />
                        <div className="flex flex-col items-start justify-center">
                          {user?.status !== "active" && (
                            <motion.p
                              className="self-end w-auto px-1 py-[3px] w-fit rounded-md text-[12px] bg-red-300 text-red-800 dark:text-red-400"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              {user?.status}
                            </motion.p>
                          )}
                          <h3 className="font-medium">{`${user?.firstName} ${user?.lastName}`}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user?.email}
                          </p>
                        </div>
                      </motion.div>

                      <div className="space-y-2">
                        <motion.div
                          variants={listItemVariants}
                          custom={1}
                          initial="hidden"
                          animate="visible"
                        >
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              variant="outline"
                              className="w-full justify-start cursor-pointer transition-colors duration-300"
                            >
                              Settings
                            </Button>
                          </motion.div>
                        </motion.div>

                        <motion.div
                          variants={listItemVariants}
                          custom={2}
                          initial="hidden"
                          animate="visible"
                        >
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              variant="outline"
                              className="w-full justify-start text-red-500 hover:text-red-600 cursor-pointer transition-colors duration-300"
                            >
                              Sign Out
                            </Button>
                          </motion.div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>
          <div className=" fixed bottom-0  flex flex-col justify-start items-start h-[calc(100vh-60px)] bg-background w-[100vw] overflow-scroll">
            {children}
          </div>
          <ChatComponent />
        </div>
    </ProjectProvider>
  );
}
