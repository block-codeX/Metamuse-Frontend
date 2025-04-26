"use client";
export default function Project({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // State for dropdown visibility
  return (
      <div className="flex-row h-screen w-full items-center justify-center">
        <div className="flex h-full w-full flex-row gap-6 mx-auto items-center justify-center p-0">
          {children}
        </div>
      </div>
  );
}

// pages/projects/[id].tsx

// Example mock data - in a real app this would come from your API/database
