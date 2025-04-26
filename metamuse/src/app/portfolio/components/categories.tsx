// components/CategoryTabs.jsx
'use client';

import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, RefreshCw, Layers } from 'lucide-react';

const CategoryTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { 
      id: 'boughtAssets', 
      label: 'Bought Assets', 
      icon: <ShoppingCart className="w-4 h-4 mr-2" /> 
    },
    { 
      id: 'resoldAssets', 
      label: 'Resold Assets', 
      icon: <RefreshCw className="w-4 h-4 mr-2" /> 
    },
    { 
      id: 'mintedProjects', 
      label: 'Minted Projects', 
      icon: <Layers className="w-4 h-4 mr-2" /> 
    },
  ];

  return (
    <motion.div
    className='w-full sticky top-0 z-10 bg-background shadow-md'
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full h-12">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className="flex items-center justify-center"
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </motion.div>
  );
};

export default CategoryTabs;