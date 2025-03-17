"use client";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brush, Search, X } from "lucide-react";
import ProjectItem from "./components/projectItem";
import NewProject from "./components/new-project";

const dummyProjects = [
  {
    id: 1,
    title: "AI Art Generator",
    description:
      "A project that generates AI-powered artworks using deep learning models.",
    completed: true,
    image: "https://source.unsplash.com/random/400x300",
    collaborators: [
      { name: "Alice", avatar: "https://i.pravatar.cc/40?img=1" },
      { name: "Bob", avatar: "https://i.pravatar.cc/40?img=2" },
    ],
  },
  {
    id: 2,
    title: "AI Art Generator",
    description:
      "A project that generates AI-powered artworks using deep learning models.",
    completed: true,
    image: "https://source.unsplash.com/random/400x300",
    collaborators: [
      { name: "Alice", avatar: "https://i.pravatar.cc/40?img=1" },
      { name: "Bob", avatar: "https://i.pravatar.cc/40?img=2" },
    ],
  },
  {
    id: 3,
    title: "AI Art Generator",
    description:
      "A project that generates AI-powered artworks using deep learning models.",
    completed: true,
    image: "https://source.unsplash.com/random/400x300",
    collaborators: [
      { name: "Alice", avatar: "https://i.pravatar.cc/40?img=1" },
      { name: "Bob", avatar: "https://i.pravatar.cc/40?img=2" },
    ],
  },
  { 
    id: 4,
    title: "AI Art Generator",
    description:
      "A project that generates AI-powered artworks using deep learning models.",
    completed: true,
    image: "https://source.unsplash.com/random/400x300",
    collaborators: [
      { name: "Alice", avatar: "https://i.pravatar.cc/40?img=1" },
      { name: "Bob", avatar: "https://i.pravatar.cc/40?img=2" },
    ],
  },
  {
    id: 5,
    title: "E-Commerce Platform",
    description:
      "Building a scalable marketplace with modern UI components and real-time updates.",
    completed: false,
    image: "https://source.unsplash.com/random/400x301",
    collaborators: [
      { name: "Charlie", avatar: "https://i.pravatar.cc/40?img=3" },
    ],
  },
  {
    id: 6,
    title: "Collaborative Whiteboard",
    description:
      "A real-time whiteboard for teams to brainstorm together seamlessly.",
    completed: false,
    image: "https://source.unsplash.com/random/400x302",
    collaborators: [
      { name: "David", avatar: "https://i.pravatar.cc/40?img=4" },
      { name: "Eve", avatar: "https://i.pravatar.cc/40?img=5" },
    ],
  },
];

// Art categories/tags for filtering
const artCategories = [
  "Painting",
  "Digital",
  "Drawing",
  "Sculpture",
  "Photography",
  "Watercolor",
  "Oil",
  "Acrylic",
  "Illustration",
  "Mixed Media",
];

export default function MarketPlace() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCategorySelect = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <>
      <div className="w-full bg-background dark:bg-background text-text-pri dark:text-text-alt sticky top-0 z-10 py-4 px-6 border-b border-gray-200 dark:border-gray-800">
        <h1 className="font-bold text-2xl">Your Art Projects</h1>

        {/* Search bar with clear button */}
        <div className="max-w-[400px] w-full mt-4 relative">
          <div className="flex items-center">
            <div className="relative flex-grow">
              <Input
                className="pr-10"
                placeholder="Search your projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={clearSearch}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <Button size="icon" variant="ghost" className="ml-2">
              <Search size={18} />
            </Button>
          </div>
        </div>

        {/* Category filters */}
        <div className="mt-4 pb-2 overflow-x-auto">
          <div className="flex space-x-2 pb-1">
            {artCategories.map((category) => (
              <Button
                key={category}
                variant={
                  selectedCategories.includes(category) ? "default" : "outline"
                }
                size="sm"
                className={`rounded-full whitespace-nowrap ${
                  selectedCategories.includes(category)
                    ? "bg-btn-primary dark:bg-btn-primary"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => handleCategorySelect(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-6 w-[calc(100%-3rem)] mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-6">
          {dummyProjects.map((project, index) => (
            <ProjectItem key={index} project={project} />
          ))}
        </div>
      </div>
      <div className="fixed bottom-20 right-20 p-4">
        <AlertDialog>
          <AlertDialogTrigger className="bg-background dark:bg-background shadow-md rounded-full h-[50px] w-[50px] active:scale-95 transition-all-300 text-text-alt  bg-btn-primary dark:bg-btn-primary flex items-center justify-center p-3 cursor-pointer ">
            <Brush size={40} />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <VisuallyHidden>
                <AlertDialogTitle>Create or Join Projects</AlertDialogTitle>
              </VisuallyHidden>
            </AlertDialogHeader>
            <NewProject />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
