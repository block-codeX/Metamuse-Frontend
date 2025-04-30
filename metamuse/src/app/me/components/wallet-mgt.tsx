"use client";

import { FC, useState } from "react";
import { format } from "date-fns";
import {
  Eye,
  EyeOff,
  Plus,
  Check,
  Trash2,
  ChevronRight,
  Star,
  RefreshCw,
  AlertCircle,
  Unlink,
  Link,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { humanizeDate } from "@/lib/utils";

// Component for each wallet card/row
interface WalletProps {
  wallet: {
    id: string;
    name: string;
    network: string;
    address: string;
    provider?: string;
    isVerified: boolean;
    isActive: boolean;
    lastUsedAt: Date | null;
  };
  isDefault: boolean;
  showAddress: Record<string, boolean>;
  toggleAddressVisibility: (walletId: string) => void;
  setAsDefault: (walletId: string) => void;
  reconnectWallet: (walletId: string) => void;
  confirmDeleteWallet: (walletId: string) => void;
  openAuthFlow: (action: "connect" | "reconnect", walletId?: string) => void;
}
const WalletItem: FC<WalletProps> = ({
  wallet,
  isDefault,
  showAddress,
  toggleAddressVisibility,
  setAsDefault,
  reconnectWallet,
  confirmDeleteWallet,
  openAuthFlow,
}) => {
  // Function to mask wallet address
  const maskWalletAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Function to get network icon/colors
  const getNetworkDetails = (network) => {
    switch (network.toLowerCase()) {
      case "ethereum":
        return {
          color: "bg-blue-100 text-blue-800",
          icon: "⟠",
        };
      case "polygon":
        return {
          color: "bg-purple-100 text-purple-800",
          icon: "⬡",
        };
      case "solana":
        return {
          color: "bg-indigo-100 text-indigo-800",
          icon: "◎",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          icon: "○",
        };
    }
  };

  const networkDetails = getNetworkDetails(wallet.network);
  const timeAgo = wallet.lastUsedAt
    ? humanizeDate(wallet.lastUsedAt)
    : "Never used";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Card className="mb-3 border group-hover:border-primary/20 transition-all">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Left section with wallet info */}
            <div className="flex items-center space-x-3 flex-1">
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-lg">{wallet.name}</span>
                  {isDefault && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge
                            variant="outline"
                            className="border-green-500 flex items-center gap-1"
                          >
                            <Check size={12} className="text-green-500" />
                            <span className="text-green-500">Default</span>
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          This is your default wallet
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {!wallet.isVerified && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge
                            variant="outline"
                            className="border-amber-500 flex items-center gap-1"
                          >
                            <AlertCircle size={12} className="text-amber-500" />
                            <span className="text-amber-500">Unverified</span>
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          This wallet hasn't been verified yet
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge
                    variant="secondary"
                    className={`${networkDetails.color} text-xs`}
                  >
                    <span className="mr-1">{networkDetails.icon}</span>
                    {wallet.network}
                  </Badge>
                  {wallet.provider && (
                    <Badge variant="outline" className="text-xs">
                      {wallet.provider}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Middle section with address */}
            <div className="flex flex-col flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Address</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleAddressVisibility(wallet.id)}
                  className="h-5 w-5"
                >
                  {showAddress[wallet.id] ? (
                    <EyeOff size={14} />
                  ) : (
                    <Eye size={14} />
                  )}
                </Button>
              </div>
              <p className="font-mono text-sm mt-1">
                {showAddress[wallet.id]
                  ? wallet.address
                  : maskWalletAddress(wallet.address)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Last used: {timeAgo}</p>
            </div>

            {/* Right section with actions */}
            <div className="flex items-center space-x-2">
              {!isDefault && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setAsDefault(wallet.id)}
                      >
                        <Star
                          size={18}
                          className="text-gray-400 hover:text-amber-400"
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Set as default wallet</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {wallet.isActive ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirmDeleteWallet(wallet.id)}
                      >
                        <Unlink
                          size={18}
                          className="text-gray-400 hover:text-red-500"
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Unlink wallet</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openAuthFlow("reconnect", wallet.id)}
                      >
                        <Link
                          size={18}
                          className="text-gray-400 hover:text-blue-500"
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reconnect wallet</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Empty state component
export const EmptyWalletState = ({ openAuthFlow }) => {
  return (
    <Card className="border-dashed border-2 bg-gray-50 dark:bg-gray-900">
      <CardContent className="p-6 flex flex-col items-center justify-center">
        <div className="rounded-full p-3 bg-primary/10 mb-4">
          <Plus size={24} className="text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-2">No wallets connected</h3>
        <p className="text-sm text-gray-500 text-center mb-4">
          Connect your first wallet to start managing your digital assets
        </p>
        <Button onClick={() => openAuthFlow("connect")}>Connect Wallet</Button>
      </CardContent>
    </Card>
  );
};

// Delete confirmation dialog
export const DeleteWalletDialog = ({
  open,
  onClose,
  onConfirm,
  walletToDelete,
  wallets,
}) => {
  const wallet = wallets.find((w) => w.id === walletToDelete);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Wallet</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this wallet? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        {wallet && (
          <div className="py-4">
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
              <p className="font-medium">{wallet.name}</p>
              <p className="font-mono text-sm mt-1 break-all">
                {wallet.address}
              </p>
              <div className="flex items-center mt-2">
                <Badge variant="secondary" className="text-xs mr-2">
                  {wallet.network}
                </Badge>
                {wallet.provider && (
                  <Badge variant="outline" className="text-xs">
                    {wallet.provider}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm(walletToDelete)}
          >
            Remove Wallet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main Wallets Section Component
export const WalletsSection = ({ openAuthFlow }) => {
  // Dummy wallet data
  const [wallets, setWallets] = useState([
    {
      id: "1",
      name: "Main Ethereum Wallet",
      network: "ethereum",
      address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      provider: "metamask",
      isVerified: true,
      isActive: true,
      lastUsedAt: new Date(Date.now() - 3600000), // 1 hour ago
    },
    {
      id: "2",
      name: "Polygon DeFi",
      network: "polygon",
      address: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
      provider: "walletconnect",
      isVerified: true,
      isActive: true,
      lastUsedAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
    },
    {
      id: "3",
      name: "Solana NFT Wallet",
      network: "solana",
      address: "HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH",
      provider: "phantom",
      isVerified: false,
      isActive: false,
      lastUsedAt: null,
    },
  ]);

  const [defaultWalletId, setDefaultWalletId] = useState("1");
  const [showAddress, setShowAddress] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState(null);

  // Toggle wallet address visibility
  const toggleAddressVisibility = (walletId) => {
    setShowAddress((prev) => ({
      ...prev,
      [walletId]: !prev[walletId],
    }));
  };

  // Set wallet as default
  const setAsDefault = (walletId) => {
    setDefaultWalletId(walletId);
  };

  // Open delete confirmation
  const confirmDeleteWallet = (walletId) => {
    setWalletToDelete(walletId);
    setDeleteDialogOpen(true);
  };

  // Delete wallet
  const deleteWallet = (walletId) => {
    setWallets((prev) => prev.filter((wallet) => wallet.id !== walletId));
    if (defaultWalletId === walletId && wallets.length > 1) {
      // Set another wallet as default
      const remainingWallets = wallets.filter((w) => w.id !== walletId);
      setDefaultWalletId(remainingWallets[0].id);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <Card className="shadow-sm max-w-4xl mx-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>Your Wallets</span>
              <Badge>{wallets.length}</Badge>
            </CardTitle>
            <CardDescription>
              Manage your connected blockchain wallets
            </CardDescription>
          </div>
          <Button
            onClick={() => openAuthFlow("connect")}
            className="flex items-center space-x-1"
          >
            <Plus size={16} />
            <span>Add Wallet</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <AnimatePresence>
          {wallets.length === 0 ? (
            <EmptyWalletState openAuthFlow={openAuthFlow} />
          ) : (
            wallets.map((wallet) => (
              <WalletItem
                key={wallet.id}
                wallet={wallet}
                isDefault={wallet.id === defaultWalletId}
                showAddress={showAddress}
                toggleAddressVisibility={toggleAddressVisibility}
                setAsDefault={setAsDefault}
                reconnectWallet={() => {}}
                confirmDeleteWallet={confirmDeleteWallet}
                openAuthFlow={openAuthFlow}
              />
            ))
          )}
        </AnimatePresence>
      </CardContent>

      {wallets.length > 0 && (
        <CardFooter className="flex flex-col space-y-4">
          <Alert className="bg-blue-50 border-blue-200 w-full">
            <AlertDescription className="text-sm">
              <strong>Tip:</strong> Set your most used wallet as default to
              streamline transactions across our platform.
            </AlertDescription>
          </Alert>
        </CardFooter>
      )}

      <DeleteWalletDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={deleteWallet}
        walletToDelete={walletToDelete}
        wallets={wallets}
      />
    </Card>
  );
};

export default WalletsSection;
