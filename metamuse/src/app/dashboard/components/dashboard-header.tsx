"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import QuickAccess from "./quick-access";

// Animation variants for Framer Motion
const headerVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      delay: 0.1,
    },
  },
};

export default function DashboardHeader({ totalEarnings }) {
  const [greeting, setGreeting] = useState("");

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    let newGreeting = "";

    if (hour < 12) newGreeting = "Good morning";
    else if (hour < 18) newGreeting = "Good afternoon";
    else newGreeting = "Good evening";

    setGreeting(newGreeting);
  }, []);

  return (
    <>
      {/* Header */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col space-y-2"
      >
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting}, Creator
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your creative portfolio
        </p>
      </motion.div>

      {/* Stats overview */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="grow stretch "
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Portfolio Earnings</CardTitle>
              <CardDescription>
                Your total earnings across all activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold h-full">
                {totalEarnings.toFixed(2)} SUI
              </div>
            </CardContent>
          </Card>
        </motion.div>
    </>
  );
}
