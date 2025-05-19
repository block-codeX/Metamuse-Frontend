// page.tsx
'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import AssetsList from './components/asset-list-component';
import CategoryTabs from './components/categories';
import EarningsSummary from './components/earning-summary';

// This would typically come from your API or state management
const mockData = {
  boughtAssets: {
    totalEarnings: 3450,
    assets: [
      { id: 1, name: 'Cosmic Dreamscape', price: 1200, imageUrl: '/api/placeholder/300/300', date: '2025-03-15' },
      { id: 2, name: 'Digital Nomad', price: 850, imageUrl: '/api/placeholder/300/300', date: '2025-03-22' },
      { id: 3, name: 'Abstract Future', price: 1400, imageUrl: '/api/placeholder/300/300', date: '2025-04-01' },
      { id: 4, name: 'Cosmic Dreamscape', price: 1200, imageUrl: '/api/placeholder/300/300', date: '2025-03-15' },
      { id: 5, name: 'Digital Nomad', price: 850, imageUrl: '/api/placeholder/300/300', date: '2025-03-22' },
      { id: 6, name: 'Abstract Future', price: 1400, imageUrl: '/api/placeholder/300/300', date: '2025-04-01' },
    ]
  },
  resoldAssets: {
    totalEarnings: 2100,
    assets: [
      { id: 7, name: 'Neon Genesis', boughtPrice: 500, soldPrice: 1200, profit: 700, imageUrl: '/api/placeholder/300/300', date: '2025-03-18' },
      { id: 8, name: 'Cyberpunk City', boughtPrice: 800, soldPrice: 2200, profit: 1400, imageUrl: '/api/placeholder/300/300', date: '2025-04-10' },
    ]
  },
  mintedProjects: {
    totalEarnings: 5600,
    assets: [
      { id: 9, name: 'Ethereal Collection', price: 3000, units: 5, imageUrl: '/api/placeholder/300/300', date: '2025-02-28' },
      { id: 10, name: 'Void Walkers', price: 2600, units: 2, imageUrl: '/api/placeholder/300/300', date: '2025-03-25' },
    ]
  }
};

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState('boughtAssets');
  
  // Calculate grand total
  const grandTotal = 
    mockData.boughtAssets.totalEarnings + 
    mockData.resoldAssets.totalEarnings + 
    mockData.mintedProjects.totalEarnings;
  
  const handleSellAsset = (assetId) => {
    // This function would be connected to your backend logic
    console.log(`Selling asset with ID: ${assetId}`);
    // Then update your state or refetch data
  };

  return (
    <div className="h-screen mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Your Portfolio</h1>
      
      <EarningsSummary 
        boughtAssetsEarnings={mockData.boughtAssets.totalEarnings}
        resoldAssetsEarnings={mockData.resoldAssets.totalEarnings}
        mintedProjectsEarnings={mockData.mintedProjects.totalEarnings}
        grandTotal={grandTotal}
      />
      
      <div className="mt-10 relative overflow-auto h-[calc(100vh-100px)]">
        <CategoryTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="mt-6">
          <AnimatePresence mode="wait">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="boughtAssets">
                <AssetsList 
                  assets={mockData.boughtAssets.assets} 
                  type="bought"
                  onSellAsset={handleSellAsset}
                />
              </TabsContent>
              
              <TabsContent value="resoldAssets">
                <AssetsList 
                  assets={mockData.resoldAssets.assets} 
                  type="resold"
                  onSellAsset={handleSellAsset}
                />
              </TabsContent>
              
              <TabsContent value="mintedProjects">
                <AssetsList 
                  assets={mockData.mintedProjects.assets} 
                  type="minted" 
                  onSellAsset={handleSellAsset}
                />
              </TabsContent>
            </Tabs>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}