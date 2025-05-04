"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Brush,
  CircleUser,
  User,
  Home,
  ShoppingBag,
  Folder,
  Settings,
  LogOut,
  Sidebar,
  Coins,
  LayoutDashboard,
} from "lucide-react";
import { useUserStore } from "@/lib/stores/user-store";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/utils";
import { toast, Toaster } from "sonner";
import ChatComponent from "../projects/studio/[projectId]/components/chat-component";

interface MySidebarProps {
  onToggle?: (collapsed: boolean) => void;
}

const MySidebar: React.FC<MySidebarProps> = ({ onToggle }) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const router = useRouter();
 const { setUser, setUserId} = useUserStore()
  // Notify parent component when sidebar state changes
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };
  const { user } = useUserStore();

  // Navigation items
  const navItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/dashboard",
    },
    {
      name: "Marketplace",
      icon: <ShoppingBag size={20} />,
      path: "/projects/marketplace",
    },
    { name: "Studio", icon: <Brush size={20} />, path: "/projects/studio" },
    { name: "Portfolio", icon: <Coins size={20} />, path: "/portfolio" },
  ];

  // Variants for animations
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

  // Ref for handling clicks outside dropdown

  // Click outside handler to close dropdown

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const goToSettings = () => {
    router.push("/me");
  };

  const logout = async () => {
      try {
        const apiInstance = api(true);
        console.log("API URL:", apiInstance.defaults.baseURL);
        const response = await api(true).post("/auth/logout");
        if (response.status === 201) {
          setUserId(null);
          setUser(null);
          toast.success("Logout Successful");
          router.push('/auth/login')
          return true;
        }
        return false;
      } catch (error: any) {
        console.error(error)
        toast.error(error?.response?.data?.message?.message || "Something went wrong!");
        router.push('/auth/login')
        return false;
      }
  }

  // Hide sidebar on "/auth/" pages
  if (pathname.startsWith("/auth/")) {
    return null;
  }

  return (
    <>
      <Toaster position="top-center" richColors/>
      <motion.div
        className={`flex-col items-center justify-start  pb-10 top-0 left-0 h-full bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-md z-40 transition-width duration-300 ease-in-out border ${
          isCollapsed ? "w-20 bg-red-500" : "w-64 fixed md:relative "
        }`}
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 25 }}
      >
        <div className="flex flex-col h-full w-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
            <span
              className={`${
                isCollapsed ? "hidden" : "block"
              } text-lg text-btn-primary font-lato font-bold`}
            >
              Metamuse
            </span>
            <Button
              variant="ghost"
              onClick={toggleCollapse}
              className="text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white p-1 cursor-pointer"
            >
              <Sidebar color="var(--btn-primary)" size={40} />
            </Button>
          </div>

          {/* Navigation Section */}
          <div className="p-4 flex flex-col justify-between h-full">
            <nav className="flex-grow">
              <ul className="space-y-2">
                {navItems.map((item, index) => (
                  <motion.li
                    key={item.name}
                    variants={listItemVariants}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant={"ghost"}
                        className={`w-full flex items-center ${
                          isCollapsed ? "justify-center" : "justify-start"
                        } py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                          pathname.startsWith(item.path)
                            ? "bg-btn-primary dark:bg-gray-700 font-medium text-text-alt"
                            : ""
                        }`}
                        onClick={() => navigateTo(item.path)}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {!isCollapsed && <span>{item.name}</span>}
                      </Button>
                    </motion.div>
                  </motion.li>
                ))}
              </ul>
            </nav>
            {/* User Section at bottom */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="ghost"
                  className={`w-full flex items-center ${
                    isCollapsed ? "justify-center" : "justify-between"
                  } py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 h-auto transition-colors duration-200 ${
                    pathname === "/me" && isCollapsed
                      ? "bg-btn-primary dark:bg-gray-700 font-medium text-text-alt"
                      : ""
                  }`}
                  onClick={goToSettings}
                >
                  <div className="flex items-center">
                    <User className="mr-3" size={20} />
                    {!isCollapsed && (
                      <div className="flex flex-col items-start">
                        {user?.status !== "active" && (
                          <motion.p
                            className="self-end px-1 py-[3px] w-fit rounded-md text-[12px] bg-red-300 text-red-800 dark:text-red-400"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            {user?.status}
                          </motion.p>
                        )}
                        <h3 className="font-medium">{`${
                          user?.firstName || ""
                        } ${user?.lastName || ""}`}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user?.email || "user@example.com"}
                        </p>
                      </div>
                    )}
                  </div>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-2"
              >
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-start py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 hover:text-red-600 transition-colors duration-200"
                  onClick={logout}
                >
                  <LogOut size={20} className="mr-3" />
                  {!isCollapsed && <span>Logout</span>}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {!isCollapsed && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black opacity-70 z-30 md:hidden sm:block backdrop-blur-sm"
          onClick={toggleCollapse}
        ></div>
      )}
      <ChatComponent/>
    </>
  );
};

export default MySidebar;
