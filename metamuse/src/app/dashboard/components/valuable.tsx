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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ArrowUpRight,
  Award
} from 'lucide-react';

// Animation variants
const assetContainerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.5
    }
  }
};

const assetItemVariants = {
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

const imageVariants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.1,
    transition: { duration: 0.3 }
  }
};

function AssetCard({ title, asset, type }) {
  return (
    <motion.div variants={assetItemVariants}>
      <Card className="h-full overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex justify-between items-center">
            {title}
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <motion.div 
              className="relative w-20 h-20 rounded-md overflow-hidden"
              whileHover="hover"
              initial="initial"
            >
              <motion.img 
                variants={imageVariants}
                src={asset.image} 
                alt={asset.name}
                className="object-cover w-full h-full"
              />
            </motion.div>
            <div className="flex-1">
              <h3 className="font-bold">{asset.name}</h3>
              <p className="text-2xl font-bold text-primary">{asset.value} SUI</p>
              {type === 'nft' ? (
                <p className="text-xs text-muted-foreground">Created by {asset.creator}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {asset.collaborators} collaborators • Your stake: {asset.stake}
                </p>
              )}
              <Link 
                href={type === 'nft' ? `/marketplace/${asset.id}` : `/projects/studio/${asset.id}/view`}
                className="mt-2 inline-flex items-center text-xs text-primary hover:underline"
              >
                View details <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ValuableAssets({ topAssets }) {
  return (
    <motion.div
      variants={assetContainerVariants}
      initial="hidden"
      animate="visible"
    >
          <div className="grid gap-6 md:grid-cols-2">
            <AssetCard 
              title="Top NFT Asset" 
              asset={topAssets.nft}
              type="nft"
            />
            <AssetCard 
              title="Top Project" 
              asset={topAssets.project}
              type="project"
            />
          </div>
    </motion.div>
  );
}