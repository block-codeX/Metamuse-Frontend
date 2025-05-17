"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Eye, Heart, Share2 } from "lucide-react";
import { Button } from "./button";
import EmptyMarketplaceCard from "@/app/components/empty-list";

export default function StaggeredGallery({
  projects,
  loading,
  setBuying,
  setModal,
  isModal,
}: {
  projects: any;
  loading: boolean;
  setBuying: any;
  setModal: any;
  isModal: any;
}) {
  const [columns, setColumns] = useState(3);
  const [liked, setLiked] = useState<Record<number, boolean>>({});

  // Determine number of columns based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setColumns(1);
      } else if (window.innerWidth < 1024) {
        setColumns(2);
      } else {
        setColumns(3);
      }
    };

    // Set initial columns
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);
    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Organize items into columns for masonry layout
  const getColumnItems = () => {
    const columnItems: any[][] = Array.from({ length: columns }, () => []);

    projects.forEach((item, index) => {
      // Distribute items evenly across columns
      console.log(item);
      const columnIndex = index % columns;
      columnItems[columnIndex].push(item);
    });

    return columnItems;
  };

  const handleLike = (id: number) => {
    setLiked((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? // Loading skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={`skeleton-${index}`} className="overflow-hidden">
                <Skeleton className="h-64 w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))
          : // Actual gallery with staggered layout {
          projects.length > 0
          ? getColumnItems().map((columnItems, colIndex) => (
              <div key={`column-${colIndex}`} className="flex flex-col gap-4">
                {columnItems.map((item) => (
                  <Card key={item._id} className="overflow-hidden group">
                    <div className="relative">
                      <AspectRatio
                        ratio={item.aspectRatio}
                        className="bg-gray-100 dark:bg-gray-800"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        />
                      </AspectRatio>

                      {/* Overlay with interaction icons */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                        <div className="flex gap-4">
                          <button className="bg-white/90 dark:bg-gray-800/90 p-2 rounded-full hover:scale-110 transition-transform">
                            <Eye size={20} />
                          </button>
                          <button
                            className="bg-white/90 dark:bg-gray-800/90 p-2 rounded-full hover:scale-110 transition-transform"
                            onClick={() => handleLike(item._id)}
                          >
                            <Heart
                              size={20}
                              fill={liked[item._id] ? "red" : "none"}
                              color={liked[item._id] ? "red" : "currentColor"}
                            />
                          </button>
                          <button className="bg-white/90 dark:bg-gray-800/90 p-2 rounded-full hover:scale-110 transition-transform">
                            <Share2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        by {item.creator.firstName} {item.creator.lastName}
                      </p>
                      <p>{item.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        {/* <Heart size={16} className="text-rose-500" /> */}
                        <span className="text-sm"> $13.33</span>
                        <Button
                          className="bg-secondary dark:bg-secondary text-white cursor-pointer active:scale-95"
                          onClick={() => {
                            setBuying(item._id);
                            setModal(true);
                          }}
                        >
                          Purchase
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))
          : <div className="w-full sm:col-span-2 lg:col-span-3 flex justify-center">
            <EmptyMarketplaceCard/>
            </div>}
      </div>
    </div>
  );
}
