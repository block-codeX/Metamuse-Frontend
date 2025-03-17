"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Eye, Heart, Share2 } from "lucide-react";

// Sample gallery items with different aspect ratios
const galleryItems = [
  {
    id: 1,
    image: "/api/placeholder/600/900",
    title: "Abstract Art Piece",
    artist: "Maria Chen",
    likes: 342,
    aspectRatio: 2/3,
  },
  {
    id: 2,
    image: "/api/placeholder/600/400",
    title: "Sunset Landscape",
    artist: "John Smith",
    likes: 219,
    aspectRatio: 3/2,
  },
  {
    id: 3,
    image: "/api/placeholder/600/600",
    title: "Urban Photography",
    artist: "Alex Johnson",
    likes: 187,
    aspectRatio: 1,
  },
  {
    id: 4,
    image: "/api/placeholder/600/700",
    title: "Portrait Study",
    artist: "Sam Davis",
    likes: 267,
    aspectRatio: 6/7,
  },
  {
    id: 5,
    image: "/api/placeholder/600/500",
    title: "Digital Illustration",
    artist: "Taylor Wong",
    likes: 423,
    aspectRatio: 6/5,
  },
  {
    id: 6,
    image: "/api/placeholder/600/800",
    title: "Nature Closeup",
    artist: "Jamie Rivera",
    likes: 158,
    aspectRatio: 3/4,
  },
  {
    id: 7,
    image: "/api/placeholder/600/450",
    title: "Concept Art",
    artist: "Morgan Patel",
    likes: 312,
    aspectRatio: 4/3,
  },
  {
    id: 8,
    image: "/api/placeholder/600/700",
    title: "Mixed Media",
    artist: "Casey Lee",
    likes: 201,
    aspectRatio: 6/7,
  },
  {
    id: 9,
    image: "/api/placeholder/600/550",
    title: "Architectural Detail",
    artist: "Robin Singh",
    likes: 176,
    aspectRatio: 12/11,
  },
];

export default function StaggeredGallery() {
  const [columns, setColumns] = useState(3);
  const [loading, setLoading] = useState(true);
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
    
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);
  
  // Organize items into columns for masonry layout
  const getColumnItems = () => {
    const columnItems: any[][] = Array.from({ length: columns }, () => []);
    
    galleryItems.forEach((item, index) => {
      // Distribute items evenly across columns
      const columnIndex = index % columns;
      columnItems[columnIndex].push(item);
    });
    
    return columnItems;
  };
  
  const handleLike = (id: number) => {
    setLiked(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">     
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={`skeleton-${index}`} className="overflow-hidden">
              <Skeleton className="h-64 w-full" />
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </Card>
          ))
        ) : (
          // Actual gallery with staggered layout
          getColumnItems().map((columnItems, colIndex) => (
            <div key={`column-${colIndex}`} className="flex flex-col gap-4">
              {columnItems.map((item) => (
                <Card key={item.id} className="overflow-hidden group">
                  <div className="relative">
                    <AspectRatio ratio={item.aspectRatio} className="bg-gray-100 dark:bg-gray-800">
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
                          onClick={() => handleLike(item.id)}
                        >
                          <Heart 
                            size={20} 
                            fill={liked[item.id] ? "red" : "none"} 
                            color={liked[item.id] ? "red" : "currentColor"}
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">by {item.artist}</p>
                    <div className="flex items-center mt-2">
                      <Heart size={16} className="text-rose-500" />
                      <span className="text-sm ml-1">{item.likes + (liked[item.id] ? 1 : 0)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}