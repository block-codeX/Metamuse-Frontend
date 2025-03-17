"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import ProjectDropDown from "./project-open";

export default function ProjectItem({ project }: { project: any }) {
  const [showMenu, setShowMenu] = useState(false);
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
          src={project.image}
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
          {project.collaborators.map((collab: any, index: number) => (
            <Avatar key={index}>
              <AvatarImage src={collab.avatar} alt={collab.name} />
            </Avatar>
          ))}
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
