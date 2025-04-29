"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Palette,
  ShoppingBag,
  TrendingUp
} from 'lucide-react';

// Animation variants
const accessVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      delay: 0.4
    }
  }
};

const buttonVariants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { type: "spring", stiffness: 300 }
  },
  tap: { 
    scale: 0.95,
    transition: { type: "spring", stiffness: 500 }
  }
};

export default function QuickAccess() {
  return (
    <motion.div 
      variants={accessVariants}
      initial="hidden"
      animate="visible"
    >
      <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
          <CardDescription>Navigate to your creative spaces</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
            >
              <Button variant="outline" className="h-24 w-full flex flex-col gap-2 items-center justify-center" asChild>
                <Link href="/projects/marketplace">
                  <ShoppingBag className="h-6 w-6 mb-1" />
                  <span>Marketplace</span>
                </Link>
              </Button>
            </motion.div>
            
            <motion.div
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
            >
              <Button variant="outline" className="h-24 w-full flex flex-col gap-2 items-center justify-center" asChild>
                <Link href="/projects/studio">
                  <Palette className="h-6 w-6 mb-1" />
                  <span>Studio</span>
                </Link>
              </Button>
            </motion.div>
          </div>
          
          <motion.div
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
          >
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}