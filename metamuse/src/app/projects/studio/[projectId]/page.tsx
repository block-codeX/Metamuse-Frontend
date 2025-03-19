// pages/projects/[id].tsx
import { GetServerSideProps } from 'next';
import ProjectView from './components/project-view';

// Example mock data - in a real app this would come from your API/database
const mockProject = {
  id: "1",
  title: "Urban Landscape in Oil",
  description: "A modern interpretation of city life captured through vibrant oil painting techniques. This collaborative project explores the interplay between architecture and nature in urban environments.",
  tags: ["Oil", "Urban", "Contemporary"],
  imageUrl: "/api/placeholder/1200/800", // Using placeholder for demo
  completed: false,
  creator: {
    id: "c1",
    firstName: "Alex",
    lastName: "Morgan",
    email: "alex.morgan@example.com"
  },
  collaborators: [
    {
      id: "c2",
      firstName: "Jamie",
      lastName: "Taylor",
      email: "jamie.taylor@example.com"
    },
    {
      id: "c3",
      firstName: "Casey",
      lastName: "Johnson",
      email: "casey.johnson@example.com"
    },
    {
      id: "c4",
      firstName: "Riley",
      lastName: "Williams",
      email: "riley.williams@example.com"
    }
  ],
  messages: [
    {
      id: "m1",
      senderId: "c1",
      content: "I've started working on the central composition. What do you think about using a warmer palette for the buildings?",
      timestamp: "2025-03-15T14:30:00"
    },
    {
      id: "m2",
      senderId: "c2",
      content: "That works! I can focus on the foreground elements with complementary cooler tones.",
      timestamp: "2025-03-15T15:45:00"
    },
    {
      id: "m3",
      senderId: "c3",
      content: "I've uploaded some reference photos that might help with the perspective on the right side.",
      timestamp: "2025-03-16T09:20:00"
    },
    {
      id: "m4",
      senderId: "c1",
      content: "Perfect! Let's sync up tomorrow to discuss the final touches.",
      timestamp: "2025-03-16T10:15:00"
    }
  ]
};

export default function ProjectPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <ProjectView project={mockProject} />
    </div>
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