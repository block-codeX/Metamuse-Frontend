"use client";

import { FC, useState } from "react";
import {
  Eye,
  EyeOff,
  Plus,
  Check,
  Star,
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
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { humanizeDate } from "@/lib/utils";
import TransactionButton from "./transaction-btn";

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
  openAuthFlow: (action: "connect" | "reconnect", walletId?: string) => void;
}
// Empty state component
export const EmptyWalletState = () => {
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
        <Button className="flex items-center space-x-2 cursor-pointer transition-all duration-200 ease-in-out active:scale-95">
          <Plus size={16} />
          Connect Wallet
        </Button>
      </CardContent>
    </Card>
  );
};


// Main Wallets Section Component
export const WalletsSection = () => {
  // Dummy wallet data
  const [wallet, setWallet] = useState(null);

  return (
    <Card className="shadow-sm max-w-4xl mx-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>Your Wallet</span>
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence>
          {wallet === null ? (
            <EmptyWalletState/>
          ) : (
            <></>
           )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default WalletsSection;
