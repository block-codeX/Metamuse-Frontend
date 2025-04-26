"use client";

import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Button } from "@/components/ui/button";
import { Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Animation variants
const insightsVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      delay: 0.5
    }
  }
};

// Sample collaboration data
const collaborationData = [
  { month: 'Jan', solo: 4, collaborative: 2 },
  { month: 'Feb', solo: 3, collaborative: 3 },
  { month: 'Mar', solo: 2, collaborative: 5 },
  { month: 'Apr', solo: 3, collaborative: 6 },
  { month: 'May', solo: 1, collaborative: 8 },
  { month: 'Jun', solo: 2, collaborative: 7 },
];

const pendingRequests = [
  {
    id: 'req-1',
    name: 'Digital Fusion Initiative',
    requester: 'Creative Nexus',
    image: '/api/placeholder/200/200',
    date: '2 days ago'
  },
  {
    id: 'req-2',
    name: 'Metaverse Art Exhibition',
    requester: 'Web3 Creators Guild',
    image: '/api/placeholder/200/200',
    date: '1 week ago'
  }
];

export default function CollaborationInsights() {
  return (
    <motion.div
      variants={insightsVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-6 md:grid-cols-2"
    >
      {/* Collaboration Chart */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Creation Insights</CardTitle>
          <CardDescription>Solo vs. collaborative content creation</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={collaborationData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7' }}
                formatter={(value) => [`${value} pieces`, '']}
              />
              <Legend />
              <Bar dataKey="solo" name="Solo Works" fill="#8884d8" />
              <Bar dataKey="collaborative" name="Collaborative" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-center text-muted-foreground">
            <p>Your collaborative works have increased by 42% in the last 3 months</p>
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      <Card className="md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Collaboration Requests</CardTitle>
            <CardDescription>Pending collaboration invitations</CardDescription>
          </div>
          <Users className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingRequests.map(request => (
            <div key={request.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img src={request.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{request.name}</h4>
                <p className="text-xs text-muted-foreground">From: {request.requester}</p>
                <p className="text-xs text-muted-foreground">{request.date}</p>
              </div>
              <Button size="sm" variant="outline" className="h-8">
                View
              </Button>
            </div>
          ))}
          
          <Button variant="ghost" size="sm" className="w-full mt-2 text-xs" asChild>
            <Link href="/collaborations/requests">
              See all requests <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}