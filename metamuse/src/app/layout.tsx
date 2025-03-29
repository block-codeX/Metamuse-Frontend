import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "./auth/context/user-context";
import { ChatProvider } from "./auth/context/chat-context";
import MinimumWidthGuard from "./components/minimum-width";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Metamuse",
  description: "Collaborative NFT design tool and marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MinimumWidthGuard minWidth={768}>
          <UserProvider>
            <ChatProvider>{children}</ChatProvider>
          </UserProvider>
        </MinimumWidthGuard>
      </body>
    </html>
  );
}
