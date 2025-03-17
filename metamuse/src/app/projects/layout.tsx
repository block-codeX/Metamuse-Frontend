"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brush, CircleUser, Ghost, Search, User } from "lucide-react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // State for dropdown visibility
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showBrushDropdown, setShowBrushDropdown] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [isMarketplace, setIsMarketplace] = useState(false);
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
  const searchRef = useRef<HTMLDivElement>(null);

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
        searchRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        !showSearchInput
      ) {
        setShowSearchInput(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearchInput]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <header className="fixed top-0 h-[60px] w-full border-b border-gray-200 flex flex-row justify-between items-center px-4 bg-background z-10">
        <div className="flex flex-row space-x-4">
          {/* Brush button with dropdown */}
          <div className="relative" ref={brushDropdownRef}>
            <Button
              variant={"ghost"}
              className="cursor-pointer"
              onClick={() => setShowBrushDropdown(!showBrushDropdown)}
            >
              <Brush />
            </Button>

            {/* Brush dropdown */}
            {showBrushDropdown && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium mb-2">Drawing Tools</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Brush className="mr-2 h-4 w-4" /> New Canvas
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Ghost className="mr-2 h-4 w-4" /> Templates
                  </Button>
                  {/* Add more options as needed */}
                </div>
              </div>
            )}
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

        <div className="flex flex-row space-x-4 justify-end items-center">
          <div className="relative" ref={userDropdownRef}>
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <User />
            </Button>

            {/* User dropdown content */}
            {showUserDropdown && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <CircleUser className="h-10 w-10" />
                  <div>
                    <h3 className="font-medium">User Name</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      user@example.com
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Settings
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-500 hover:text-red-600"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className=" fixed bottom-0  flex flex-col justify-start items-start h-[calc(100vh-60px)] bg-background w-[100vw]  overflow-scroll">
        {children}
      </div>
    </div>
  );
}
