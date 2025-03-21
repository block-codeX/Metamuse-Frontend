"use client";

import { useState, useRef, useEffect } from "react";
export default function Project({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // State for dropdown visibility

  return (
    <>
      <div className="min-h-screen border-red-500 bg-muted/30">
    {children}
    </div>
    </>
  );
}
