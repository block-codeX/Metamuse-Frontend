"use client"
import React from 'react';
import { ShoppingBag, AlertCircle } from 'lucide-react';

const EmptyMarketplaceCard = () => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 w-full max-w-md mx-auto">
      <div className="bg-secondary/10  dark:bg-secondary/20 p-4 rounded-full mb-4">
        <ShoppingBag className="w-12 h-12 text-secondary" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        No Items Available
      </h3>
      
      <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
        There are currently no minted items in the marketplace. Check back later or be the first to mint something!
      </p>
    </div>
  );
};

export default EmptyMarketplaceCard;