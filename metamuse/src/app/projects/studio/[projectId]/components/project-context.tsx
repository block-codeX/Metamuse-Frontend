"use client"
import React, { createContext, useState, useEffect, useContext } from "react";
import { api } from "@/lib/utils";
import { useParams } from "next/navigation";

interface Person {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  creator: Person;
  collaborators: Person[];
  conversation: string;
  createdAt: string;
  forkedFrom: string | null;
  gridFsId: string;
  tags: string[];
  isForked: boolean;
  updatedAt: string;
}

interface ProjectContextProps {
  project: Project | null;
  setProject: (project: Project) => void;
}

const ProjectContext = createContext<ProjectContextProps | undefined>(
  undefined
);

interface ProjectProviderProps {
  children: React.ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [project, setProject] = useState<Project | null>(null);
  const { projectId } = useParams();

  useEffect(() => {
    const fetchProject = async (id: string) => {
      try {
        const response = await api(true).get(`/projects/${id}`);
        const data = await response.data;
        console.log("DAta", data);
        setProject(data);
      } catch (error) {
        console.error("Failed to fetch project:", error);
      }
    };

    if (projectId) {
      fetchProject(projectId as string);
    }
  }, [projectId]);

  return (
    <ProjectContext.Provider value={{ project, setProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextProps => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
