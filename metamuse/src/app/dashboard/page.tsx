"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CollaborationInsights from "./components/collaborative-insights";
import DashboardHeader from "./components/dashboard-header";
import PortfolioChart from "./components/portfolio-chart";
import QuickAccess from "./components/quick-access";
import RecentActivity from "./components/recent";
import ValuableAssets from "./components/valuable";

// Dummy data for the portfolio
const portfolioData = [
  { name: "Listed Projects", value: 45, color: "#8884d8" },
  { name: "Purchased NFTs", value: 30, color: "#82ca9d" },
  { name: "Resold NFTs", value: 25, color: "#ffc658" },
];

// Dummy data for most valuable assets
const topAssets = {
  nft: {
    id: "nft-123",
    name: "Cosmic Dreamscape",
    value: 12.5,
    image: "/api/placeholder/400/320",
    creator: "Stella Nova",
  },
  project: {
    id: "proj-456",
    name: "Digital Renaissance",
    value: 24.8,
    image: "/api/placeholder/400/320",
    collaborators: 7,
    stake: "32%",
  },
};

// Animation variants for Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

export default function Dashboard() {
  const [totalEarnings, setTotalEarnings] = useState(0);

  // Calculate total earnings from portfolio data on load
  useEffect(() => {
    const earnings = portfolioData.reduce(
      (total, item) => total + item.value,
      0
    );
    setTotalEarnings(earnings * 0.32); // Dummy calculation for this example
  }, []);

  // Data for recent activities
  const recentActivities = [
    {
      id: "act-1",
      type: "sale",
      title: "Mystic Landscape NFT Sold",
      timestamp: "2 hours ago",
      amount: "5.2 SUI",
      image: "/api/placeholder/200/200",
    },
    {
      id: "act-2",
      type: "collaboration",
      title: "New Collaboration Request",
      timestamp: "Yesterday",
      from: "Digital Dreams Studio",
      image: "/api/placeholder/200/200",
    },
    {
      id: "act-3",
      type: "mint",
      title: "NFT Collection Minted",
      timestamp: "3 days ago",
      amount: "10 items",
      image: "/api/placeholder/200/200",
    },
  ];

  return (
    <motion.div
      className="space-y-6 p-6 h-screen w-full overflow-scroll"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Section */}
      <motion.div variants={itemVariants}>
        <DashboardHeader totalEarnings={totalEarnings} />
      </motion.div>

      {/* Analytics and Quick Access Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Portfolio Distribution */}
        <motion.div variants={itemVariants}>
          <PortfolioChart portfolioData={portfolioData} />
        </motion.div>
        <div className="flex flex-col gap-6">
          {/* Quick Access Section */}
          <QuickAccess/>
                  {/* Creator Stats Section */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Creator Stats</CardTitle>
              <CardDescription>Your performance as a creator</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <h4 className="text-muted-foreground text-sm">
                    Projects Created
                  </h4>
                  <p className="text-3xl font-bold">12</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <h4 className="text-muted-foreground text-sm">Total Sales</h4>
                  <p className="text-3xl font-bold">87.5 SUI</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <h4 className="text-muted-foreground text-sm">
                    Collaboration Requests
                  </h4>
                  <p className="text-3xl font-bold">8</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        </div>
      </div>

      {/* Valuable Assets and Activity Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="assets" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="assets">Most Valuable Assets</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="collaborations">
              Active Collaborations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="border p-5 bg-white rounded-md">
            <ValuableAssets topAssets={topAssets} />
          </TabsContent>

          <TabsContent value="activity">
            <RecentActivity activities={recentActivities} />
          </TabsContent>

          <TabsContent value="collaborations">
            <Card>
              <CardHeader>
                <CardTitle>Active Collaborations</CardTitle>
                <CardDescription>
                  Projects you're currently collaborating on
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <motion.div
                      key={`collab-${i}`}
                      className="bg-muted/50 p-4 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-md overflow-hidden">
                          <img
                            src="/api/placeholder/200/200"
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium">
                            Collaborative Project {i}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            4 collaborators
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Your stake: 25%</span>
                        <span className="text-primary">2.5 SUI earned</span>
                      </div>
                      <div className="mt-2 flex justify-between">
                        <span className="text-xs text-muted-foreground">
                          Last updated: 2 days ago
                        </span>
                        <span className="text-xs text-primary hover:underline cursor-pointer">
                          View details
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Collaboration Insights Section */}
      <motion.div variants={itemVariants}>
        <CollaborationInsights />
      </motion.div>
    </motion.div>
  );
}
