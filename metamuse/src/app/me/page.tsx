"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Eye, EyeOff, ChevronRight, Sun, Moon } from "lucide-react";
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserStore } from "@/lib/stores/user-store";
import AuthFlowModal from "./components/profile-update";
import { Switch } from "@/components/ui/switch";
import WalletsSection from "./components/wallet-mgt";
import OTPGuardFlow from "./components/otp-guard";
import {
  SecureTransactionProvider,
} from "./components/useSecureTransaction";
import TransactionButton from "./components/transaction-btn";
import { useTheme } from "../components/theme";
import DarkModeToggle from "@/components/ui/dark-mode-toggle";

export default function UserProfilePage() {
  const { user } = useUserStore();
  const [showWalletAddress, setShowWalletAddress] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authTarget, setAuthTarget] = useState(null); // "password" or "wallet"
  const { isDark, toggleTheme } = useTheme();
  const [transactionId, setTransactionId] = useState(null)
  const toggleWalletVisibility = () => {
    setShowWalletAddress(!showWalletAddress);
  };

  // Function to mask wallet address
  const maskWalletAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const handleOpenModal = (target) => {
    setAuthTarget(target);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAuthTarget(null);
  };

  return (
    <SecureTransactionProvider>
      <div className="bg-background space-y-8 w-full mb-10">
        <div className="sticky flex top-0 bg-background items-center px-6 pt-6 justify-between">
          <h1 className="text-3xl font-bold">{user?.firstName}</h1>
          <div className="flex items-center space-x-2">
            <DarkModeToggle
              isDark={isDark}
              toggleDark={toggleTheme}
              size={30}
              />
          </div>
        </div>
        <Card className="shadow-sm max-w-4xl mx-6">
          <CardHeader>
            <CardTitle className="flex items-end justify-between">
              <h3>Personal Information</h3>
              <span
                className={`self-end px-1 py-[3px] w-fit rounded-md text-[12px] font-normal ${
                  user?.status !== "active"
                    ? "bg-error text-red-900"
                    : " bg-success text-primary"
                }`}
              >
                {user?.status || "active"}
              </span>
            </CardTitle>
            <CardDescription>
              Manage your personal details and account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">First Name</p>
                <p className="mt-1 text-base">{user?.firstName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Name</p>
                <p className="mt-1 text-base">{user?.lastName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Email Address
                </p>
                <p className="mt-1 text-base">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date Joined</p>
                <p className="mt-1 text-base">
                  {user?.createdAt
                    ? format(new Date(user.createdAt), "PPP")
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 items-start sm:items-center">
            <TransactionButton
            buttonText={"Change Password"}
            transactionType={"password"}
            transactionData={{}}
            setId={setTransactionId}
            icon={null}
            iconOnly={false}
            classes={''}
            variant={"outline"}
            />
          </CardFooter>
        </Card>
        <WalletsSection openAuthFlow={setTransactionId} transactionId={transactionId}  />
        <Card className="shadow-sm max-w-4xl mx-6">
          <CardHeader>
            <CardTitle><h3>Security Settings</h3></CardTitle>
            <CardDescription>
              Manage your account security and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-medium">Account Deactivation</h4>
                  <p className="text-sm text-gray-500">
                    Permanently remove your account and all associated data
                  </p>
                </div>
              </div>
              <Separator />
              <Alert className="bg-warning/10 border-warning/90 text-text-primary">
                <AlertDescription>
                  To deactivate your account, please send an email to{" "}
                  <span className="font-medium">support@metamuse.online</span>{" "}
                  with the subject line "Account Deactivation Request".
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
        <OTPGuardFlow tId={transactionId} />
      </div>
    </SecureTransactionProvider>
  );
}
