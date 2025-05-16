import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import {
  Syne,
  Source_Sans_3,
  Plus_Jakarta_Sans,
  Rubik_Mono_One,
  Space_Grotesk,
} from "next/font/google";
import Content from "./components/content";
import ThemeProvider from "./components/theme";
export const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
});

export const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-source-sans-3",
});

export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta-sans",
});

export const rubikMonoOne = Rubik_Mono_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-rubik-mono-one",
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

// Load local fonts
export const clashDisplay = localFont({
  src: "./fonts/clash-display.woff2",
  variable: "--font-clash-display",
  display: "swap",
});

export const satoshi = localFont({
  src: "./fonts/satoshi.woff2",
  variable: "--font-satoshi",
  display: "swap",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        ></link>
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400&family=Montserrat:ital,wght@0,400;0,700;1,400&family=Open+Sans:ital,wght@0,400;0,700;1,400&family=Poppins:ital,wght@0,400;0,700;1,400&family=Raleway:ital,wght@0,400;0,700;1,400&family=Roboto:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body
        className={`
        ${syne.variable} 
        ${sourceSans3.variable} 
        ${plusJakartaSans.variable} 
        ${rubikMonoOne.variable} 
        ${spaceGrotesk.variable}
        ${clashDisplay.variable}
        ${satoshi.variable}
        antialiased
      `}
      >
        <ThemeProvider>
                    <Content children={children} />

        </ThemeProvider>
      </body>
    </html>
  );
}
