// components/AssetsList.jsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,

  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowUpRight, Coins, Tag } from 'lucide-react';

const AssetsList = ({ assets, type, onSellAsset }) => {
  const [viewMode, setViewMode] = useState('grid');
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [sellPrice, setSellPrice] = useState('');

  // Format the currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSellClick = (asset) => {
    setSelectedAsset(asset);
    setSellPrice(asset.price.toString());
    setSellDialogOpen(true);
  };

  const handleSellConfirm = () => {
    if (onSellAsset) {
      onSellAsset(selectedAsset.id, parseFloat(sellPrice));
    }
    setSellDialogOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Custom columns per asset type
  const getGridContent = (asset) => {
    switch(type) {
      case 'bought':
        return (
          <>
            <div className="text-lg font-semibold mt-2">{asset.name}</div>
            <div className="text-2xl font-bold mt-1">{formatCurrency(asset.price)}</div>
            <div className="text-sm text-gray-500 mt-1">Purchased on {new Date(asset.date).toLocaleDateString()}</div>
            <div className="mt-4">
              <Button 
                onClick={() => handleSellClick(asset)} 
                className="w-full"
                size="sm"
              >
                <Tag className="w-4 h-4 mr-2" />
                Sell Asset
              </Button>
            </div>
          </>
        );
      case 'resold':
        return (
          <>
            <div className="text-lg font-semibold mt-2">{asset.name}</div>
            <div className="flex items-center mt-2">
              <span className="text-gray-500">Bought: {formatCurrency(asset.boughtPrice)}</span>
              <ArrowUpRight className="mx-2 text-green-500" />
              <span>Sold: {formatCurrency(asset.soldPrice)}</span>
            </div>
            <div className="text-2xl font-bold text-green-600 mt-2">
              +{formatCurrency(asset.profit)}
            </div>
            <div className="text-sm text-gray-500 mt-1">Sold on {new Date(asset.date).toLocaleDateString()}</div>
          </>
        );
      case 'minted':
        return (
          <>
            <div className="text-lg font-semibold mt-2">{asset.name}</div>
            <div className="text-2xl font-bold mt-1">{formatCurrency(asset.price)}</div>
            <div className="text-sm text-gray-500 mt-1">
              <span className="inline-flex items-center">
                <Coins className="w-4 h-4 mr-1" />
                {asset.units} units minted
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Created on {new Date(asset.date).toLocaleDateString()}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  // Custom columns for table view
  const getTableColumns = () => {
    switch(type) {
      case 'bought':
        return (
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Purchase Price</TableHead>
            <TableHead>Purchase Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        );
      case 'resold':
        return (
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Bought Price</TableHead>
            <TableHead>Sold Price</TableHead>
            <TableHead>Profit</TableHead>
            <TableHead>Sale Date</TableHead>
          </TableRow>
        );
      case 'minted':
        return (
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Units</TableHead>
            <TableHead>Minted Date</TableHead>
          </TableRow>
        );
      default:
        return null;
    }
  };

  // Custom row data for table view
  const getTableRow = (asset) => {
    switch(type) {
      case 'bought':
        return (
          <TableRow key={asset.id}>
            <TableCell>{asset.name}</TableCell>
            <TableCell>{formatCurrency(asset.price)}</TableCell>
            <TableCell>{new Date(asset.date).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <Button 
                onClick={() => handleSellClick(asset)} 
                variant="outline" 
                size="sm"
              >
                <Tag className="w-4 h-4 mr-2" />
                Sell
              </Button>
            </TableCell>
          </TableRow>
        );
      case 'resold':
        return (
          <TableRow key={asset.id}>
            <TableCell>{asset.name}</TableCell>
            <TableCell>{formatCurrency(asset.boughtPrice)}</TableCell>
            <TableCell>{formatCurrency(asset.soldPrice)}</TableCell>
            <TableCell className="text-green-600">+{formatCurrency(asset.profit)}</TableCell>
            <TableCell>{new Date(asset.date).toLocaleDateString()}</TableCell>
          </TableRow>
        );
      case 'minted':
        return (
          <TableRow key={asset.id}>
            <TableCell>{asset.name}</TableCell>
            <TableCell>{formatCurrency(asset.price)}</TableCell>
            <TableCell>{asset.units}</TableCell>
            <TableCell>{new Date(asset.date).toLocaleDateString()}</TableCell>
          </TableRow>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex justify-end mb-4">
        <Tabs value={viewMode} onValueChange={setViewMode} className="w-auto">
          <TabsList>
            <TabsTrigger value="grid">Grid</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {assets.map((asset) => (
              <motion.div key={asset.id} variants={itemVariants}>
                <Card className="overflow-hidden h-full">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={asset.imageUrl} 
                      alt={asset.name} 
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardContent className="p-4">
                    {getGridContent(asset)}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <Table>
                <TableHeader>
                  {getTableColumns()}
                </TableHeader>
                <TableBody>
                  {assets.map(asset => getTableRow(asset))}
                </TableBody>
              </Table>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sell Dialog */}
      <Dialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sell Asset</DialogTitle>
            <DialogDescription>
              Place your asset on the marketplace.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAsset && (
            <>
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedAsset.imageUrl}
                    alt={selectedAsset.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-medium">{selectedAsset.name}</h3>
                    <p className="text-sm text-gray-500">
                      Purchased for {formatCurrency(selectedAsset.price)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="price" className="text-sm font-medium">
                    Selling Price
                  </label>
                  <Input
                    id="price"
                    type="number"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                    placeholder="Enter selling price"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSellDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSellConfirm}>
                  List for Sale
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AssetsList;