"use client";
import { FC, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSecureTransaction } from "./useSecureTransaction";
import { useUserStore } from "@/lib/stores/user-store";
import { api } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const ChangePassword: FC<{ transactionId: string }> = ({
  transactionId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUserStore();
  const { updateTransaction, setStep, handleTransaction } = useSecureTransaction();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  handleTransaction.current = async (payload: any) => {
    try {
      await api(true).post("/auth/password/reset", payload);
    } catch (error) {
      console.error(error);
      throw error; // Re-throw to allow provider to handle error
    }
  };

  
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleFormSubmit = () => {
    setIsSubmitting(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setIsSubmitting(false);
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setIsSubmitting(false);
      return;
    }
    
    // Set the success function first

    // Prepare transaction data with success message
    const data = {
      password: formData.password,
      email: user?.email,
      successMessage: "Password changed successfully!" // Include success message in transaction data
    };
    
    // Update transaction data
    const updated = updateTransaction(transactionId, data);
    
    if (updated) {
      // Only proceed if transaction was successfully updated
      setStep("transact"); // This will now trigger processing through setStepAndProcess
    } else {
      setIsSubmitting(false);
      toast.error("Transaction could not be updated");
    }
  };

  return (
    <div className="py-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Enter new password"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="Confirm new password"
        />
      </div>
      <Button
        onClick={handleFormSubmit}
        disabled={
          !formData.password || !formData.confirmPassword || isSubmitting
        }
        className="w-full bg-secondary hover:bg-secondary/80 text-primary cursor-pointer font-syne font-semibold"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Change Password"
        )}
      </Button>
    </div>
  );
};



const coins = [
  "Algorand", "Arweave", "Avalanche", "Axie Infinity", "Aave", "Binance Smart Chain", 
  "Bitcoin", "Cardano", "Celo", "Chainlink", "Chiliz", "Compound", "Cosmos", 
  "Decentraland", "Dogecoin", "Elrond", "Enjin", "Ethereum", "Fantom", 
  "Filecoin", "Flow", "Gala", "Harmony", "Hedera", "Kusama", "Litecoin", 
  "Near", "PancakeSwap", "Polygon", "Polkadot", "Shiba Inu", "Solana", 
  "Stellar", "SushiSwap", "Terra", "Tezos", "The Sandbox", "Theta", 
  "Uniswap", "VeChain", "Zilliqa", "Sui"
];

const providers = [
  "Atomic Wallet", "Binance Wallet", "BitPay", "Coinbase", "Coinomi", 
  "Crypto.com", "Exodus", "Guarda", "Ledger", "Metamask", 
  "MyEtherWallet", "SafePal", "Trezor", "Trust Wallet", "WalletConnect",
];

export const NewWallet: FC<{ transactionId: string }> = ({ transactionId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUserStore();
  const { updateTransaction, setStep, handleTransaction } = useSecureTransaction();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    network: "",
    provider: "",
  });

  handleTransaction.current = async (payload: any) => {
    try {
      await api(true).post("/wallets", payload);
    } catch (error) {
      console.error(error);
      throw error; // Re-throw to allow provider to handle error
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = () => {
    setIsSubmitting(true);
    // Validation
    if (!formData.name || !formData.address || !formData.network) {
      toast.error("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }
    
    // Prepare transaction data with success message
    const data = {
      ...formData,
      email: user?.email,
      successMessage: "Wallet added successfully!", // Include success message in transaction data
    };
    
    // Update transaction data
    const updated = updateTransaction(transactionId, data);
    if (updated) {
      // Only proceed if transaction was successfully updated
      setStep("transact"); // This will now trigger processing through setStepAndProcess
    } else {
      setIsSubmitting(false);
      toast.error("Transaction could not be updated");
    }
  };

  return (
    <div className="py-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Wallet Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter wallet name"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Wallet Address</Label>
        <Input
          id="address"
          name="address"
          type="text"
          value={formData.address}
          onChange={handleInputChange}
          placeholder="Enter wallet address"
        />
      </div>
      
      {/* Network and Provider fields side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="network">Network</Label>
          <Select
            value={formData.network}
            onValueChange={(value) => handleSelectChange(value, "network")}
          >
            <SelectTrigger id="network">
              <SelectValue placeholder="Select network" />
            </SelectTrigger>
            <SelectContent>
              {coins.map((coin) => (
                <SelectItem key={coin} value={coin}>
                  {coin}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="provider">Provider</Label>
          <Select
            value={formData.provider}
            onValueChange={(value) => handleSelectChange(value, "provider")}
          >
            <SelectTrigger id="provider">
              <SelectValue placeholder="Select provider (optional)" />
            </SelectTrigger>
            <SelectContent>
              {providers.map((provider) => (
                <SelectItem key={provider} value={provider}>
                  {provider}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button
        onClick={handleFormSubmit}
        disabled={!formData.name || !formData.address || !formData.network || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Add Wallet"
        )}
      </Button>
    </div>
  );
};