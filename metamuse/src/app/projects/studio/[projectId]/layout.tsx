"use client";

import MinimumWidthGuard from "@/app/components/minimum-width";

export default function Project({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // State for dropdown visibility
  return (
    <MinimumWidthGuard minWidth={768}>
      <div className="fixed flex-row h-[calc(100%-60px)] bottom-0 w-screen justify-center">
        <div className="flex flex-row gap-6 h-[calc(100%-3em)] w-[calc(100vw-6em)] mx-auto my-6 items-center justify-center p-0">
          {children}
        </div>
      </div>
    </MinimumWidthGuard>
  );
}

// pages/projects/[id].tsx

// Example mock data - in a real app this would come from your API/database
