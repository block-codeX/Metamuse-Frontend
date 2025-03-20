"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { api } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Define validation schema using Zod
const newProjectSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  tags: z.array(z.string()).nonempty({ message: "At least one tag must be selected" }),
});

// Art categories for selection
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

export default function NewProject() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { handleSubmit, register, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(newProjectSchema),
  });
  const router = useRouter();
  // Handle selecting a tag
  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      const newTags: any = [...selectedTags, tag];
      setSelectedTags(newTags);
      setValue("tags", newTags);
    }
  };

  // Handle removing a tag
  const handleTagRemove = (tag: string) => {
    const newTags: any = selectedTags.filter((t) => t !== tag);
    setSelectedTags(newTags);
    setValue("tags", newTags);
  };
  const newProject = async (data: any) => {
    data.isForked = false;
    try {
      const response = await api(true).post("/projects/new", data)
      if (response.status === 201) {
        toast("Project created successfully");
        router.push("studio/" + response.data._id);
        return true;
      }
    } catch (error: any) {
      toast(error?.response?.data?.message?.message || "Something went wrong!");
      return false;
    }
  }
  // Handle form submission
  const handleFormSubmit = async (data: any) => {
    console.log(data); // Print collected values to the console
    await newProject(data);
  };

  return (
    <Tabs defaultValue="create" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="create">Create Project</TabsTrigger>
        <TabsTrigger value="existing">Join Existing</TabsTrigger>
      </TabsList>
      <TabsContent value="create">
        <Card>
          <CardHeader>
            <CardTitle>New Project</CardTitle>
            <CardDescription>Create a new project from scratch</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title")} />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} className="resize-none h-32" />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    Select Tags
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-2">
                  <div className="flex flex-col space-y-1">
                    {artCategories.map((category) => (
                      <Button
                        key={category}
                        variant="ghost"
                        onClick={() => handleTagSelect(category)}
                        className="justify-start"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              {/* Display selected tags as badges */}
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => handleTagRemove(tag)}
                      className="ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              {errors.tags && <p className="text-sm text-red-500">{errors.tags.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmit(handleFormSubmit)} className="bg-btn-primary dark:bg-btn-primary">
              Create
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="existing">
        <Card>
          <CardHeader>
            <CardTitle>Join Project</CardTitle>
            <CardDescription>Join an existing project by entering the access token</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="token">Token</Label>
              <Input id="token" type="password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="bg-btn-primary dark:bg-btn-primary">Join</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}