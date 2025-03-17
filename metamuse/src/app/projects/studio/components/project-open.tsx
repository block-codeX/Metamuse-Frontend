import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ProjectDropDown({ project }: { project: any }) {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40">
        <button
          className={`w-full text-left px-4 py-2 text-sm ${
            project.completed
              ? "text-gray-400 cursor-not-allowed"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
          disabled={project.completed}
          onClick={() => !project.completed && navigateTo(`/projects/${project.id}/canvas`)}
        >
          Join Canvas
        </button>
        <button
          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => navigateTo(`/projects/${project.id}/view`)}
        >
          View Details
        </button>
      </PopoverContent>
    </Popover>
  );
}
