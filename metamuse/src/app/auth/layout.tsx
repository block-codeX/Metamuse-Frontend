import { Toaster } from "@/components/ui/sonner";
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="flex justify-center items-center min-h-screen bg-gray-50 max-w-[450px] w-[90%]">
        {children}
      </div>
      <Toaster />

    </div>
  );
}
