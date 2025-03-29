"use client";

import { useEffect, useState } from "react";
import StaggeredGallery from "@/components/ui/gallery";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { api } from "@/lib/utils";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import EmptyMarketplaceCard from "@/app/components/empty-list";

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
  "Mixed Media"
];

export default function MarketPlace() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState([])
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [buying, setBuying] = useState("");
  const [isModal, setModal] = useState(false);

  const handleCategorySelect = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };
  const fetchProjects = async (val = 1) => {
    setLoading(true)
    let url = `/projects/all?page=${val}`;
    if (selectedCategories.length) url += `&tags=${selectedCategories.join(",")}`;
    if (searchQuery) url += `&title=${searchQuery}`;
    try {
      const response = await api(true).get(url);
      if (response.status === 200) {
        const { docs, next, page, totalDocs } = response.data;
        setProjects(docs);
        setNextPage(next);
        }
      setLoading(false)
    } catch (error: any) {
      toast(error?.response?.data?.message?.message || "Something went wrong loading the pages");
    }
  }
  useEffect(() => {
    if (!buying) return;
    const project = projects.find((project) => project._id === buying);
    if (project) {
      setProject(project);
    }
  }, [buying])
  useEffect(() => {
    fetchProjects(currentPage);
  }, [currentPage])
  useEffect(() => {
    fetchProjects();
  }, [selectedCategories, searchQuery]);
  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <>
      <div className="w-full bg-background dark:bg-background text-text-pri dark:text-text-alt sticky top-0 z-10 py-4 px-6 border-b border-gray-200 dark:border-gray-800">
        <h1 className="font-bold text-2xl">Browse Stunning Artworks</h1>

        {/* Search bar with clear button */}
        <div className="max-w-[400px] w-full mt-4 relative">
          <div className="flex items-center">
            <div className="relative flex-grow">
              <Input
                className="pr-10"
                placeholder="Search for artworks..."
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
                variant={selectedCategories.includes(category) ? "default" : "outline"}
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
        <StaggeredGallery isModal={isModal} loading={loading} projects={projects} setBuying={setBuying} setModal={setModal}/>
      </div>
      <AlertDialog open={isModal} onOpenChange={() => setModal(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{project?.title}</AlertDialogTitle>
            <AlertDialogDescription>
             {project?.description}
              .{" "} Are you sure you want to buy this project?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
