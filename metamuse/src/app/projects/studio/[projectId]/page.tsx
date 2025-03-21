// pages/projects/[id].tsx
"use client"
import ProjectView from "./components/project-view";
import { ProjectProvider, useProject } from "./components/project-context";
import { ProjectWrapper } from "./components/project-context-wrapper";

// Example mock data - in a real app this would come from your API/database

export default function ProjectPage() {
  return (
    <ProjectProvider>
      <ProjectWrapper>
      <ProjectView  />
      </ProjectWrapper>
    </ProjectProvider>
  );
}

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   // In a real application, you would fetch the project data here
//   // const projectId = context.params?.id;
//   // const project = await fetchProject(projectId);

//   return {
//     props: {
//       // Pass the project data here
//     },
//   };
// };
