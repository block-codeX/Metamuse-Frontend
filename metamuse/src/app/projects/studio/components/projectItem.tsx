"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import ProjectDropDown from "./project-open";
import {
  getInitials,
  getRandomComplementaryColors,
  reconstructImg,
} from "@/lib/utils";
import * as fabric from "fabric";
export default function ProjectItem({ project }: { project: any }) {
  const [showMenu, setShowMenu] = useState(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const canvasEl = document.createElement("canvas");
    document.body.appendChild(canvasEl);

    // Initialize Fabric.js on your canvas element
    const fabricCanvas = new fabric.Canvas(canvasEl, {
      width: window.innerWidth - 100,
      height: window.innerHeight,
      backgroundColor: "#ffffff",
    });
    // fabricCanvas.loadFromJSON
    const getImg = async () => {
      // Create a temporary canvas element
      try {
        const url = await reconstructImg(
          fabricCanvas,
          project._id,
        );
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

    getImg();
  }, [project.title]);

  // Navigate to a specific route
  const navigateTo = (path: string) => {
    router.push(path);
    setShowMenu(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col relative">
      {/* Project Image */}
      <div className="w-full h-40 bg-gray-300 rounded-lg overflow-hidden">
        <img
          src={imgUrl}
          alt={project.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Project Details */}
      <div className="mt-3">
        <h2 className="font-bold text-lg">{project.title}</h2>
        <p className="text-sm text-gray-500 mt-1">{project.description}</p>

        {/* Collaborators */}
        <div className="flex items-center mt-3 space-x-2">
          {project.collaborators.map((collab: any, index: number) => {
            const colors = getRandomComplementaryColors();
            return (
              <Avatar key={index}>
                <AvatarFallback
                  className="bg-primary text-primary-foreground text-xs"
                  style={{
                    backgroundColor: colors[index % 2].background,
                    color: colors[index % 2].text,
                  }}
                >
                  {getInitials(collab.firstName, collab.lastName)}
                </AvatarFallback>{" "}
              </Avatar>
            );
          })}
        </div>

        {/* Status & Actions */}
        <div className="mt-3 flex justify-between items-center">
          <span
            className={`text-xs font-medium px-2 py-1 rounded-lg ${
              project.completed
                ? "bg-green-100 text-green-600"
                : "bg-yellow-100 text-yellow-600"
            }`}
          >
            {project.completed ? "Completed" : "In Progress"}
          </span>
          <ProjectDropDown project={project} />
        </div>
      </div>
    </div>
  );
}
