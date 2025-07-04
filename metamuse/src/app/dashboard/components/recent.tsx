"use client";

import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Clock, CreditCard, Palette, Users } from 'lucide-react';
import Link from 'next/link';

// Animation variants
const activityContainerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const activityItemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

// Activity type icons
const activityIcons = {
  sale: <CreditCard className="h-4 w-4" />,
  mint: <Palette className="h-4 w-4" />,
  collaboration: <Users className="h-4 w-4" />,
  default: <Clock className="h-4 w-4" />
};

export default function RecentActivity({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest transactions and collaborations</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">No recent activity to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      variants={activityContainerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest transactions and collaborations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div 
              key={activity.id || index}
              variants={activityItemVariants}
              className="flex items-center gap-4 p-3 bg-muted/50 rounded-md"
            >
              <div className="w-12 h-12 rounded-md overflow-hidden">
                <img 
                  src={activity.image || "/api/placeholder/200/200"} 
                  alt={activity.title} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs px-2 py-0 h-5">
                    {activityIcons[activity.type] || activityIcons.default}
                    <span className="ml-1">{activity.type}</span>
                  </Badge>
                  <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                </div>
                <h4 className="font-medium mt-1">{activity.title}</h4>
                {activity.amount && <p className="text-sm font-medium">{activity.amount}</p>}
                {activity.from && <p className="text-sm">From: {activity.from}</p>}
                {activity.url && (
                  <Link 
                    href={activity.url}
                    className="mt-1 inline-flex items-center text-xs text-primary hover:underline"
                  >
                    View details <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}