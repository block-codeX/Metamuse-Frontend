// UserProfilePage.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Eye, EyeOff, ChevronRight } from "lucide-react";
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

export default function UserProfilePage() {
  // Sample user data - replace with your actual data fetching logic
  const [Kuser, setUser] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    avatarUrl: "/api/placeholder/100/100",
    dateJoined: new Date("2023-05-15"),
    walletAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  });
  const { user } = useUserStore();
  const [showWalletAddress, setShowWalletAddress] = useState(false);

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

  return (
    <div className="bg-background space-y-8 w-full  mb-10">
      <div className="sticky flex top-0 bg-background items-center px-6 pt-6 justify-between">
        <h1 className="text-3xl font-bold">{user?.firstName}</h1>
        <Avatar className="h-16 w-16">
          <AvatarFallback>
            {user?.firstName.charAt(0)}
            {user?.lastName.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
      <Card className="shadow-sm max-w-4xl mx-6">
        <CardHeader>
          <CardTitle className="flex items-end justify-between">
            <span>Personal Information</span>
            <span
              className={`self-end px-1 py-[3px] w-fit rounded-md text-[12px]  text-red-800 dark:text-red-400 ${
                user?.status !== "active" ? "bg-red-300" : "bg-green-300"
              }`}
            >
              {user?.status}
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
              <p className="text-sm font-medium text-gray-500">Email Address</p>
              <p className="mt-1 text-base">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Date Joined</p>
              <p className="mt-1 text-base">
                {format(user?.createdAt as string, "PPP")}
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-gray-500">
                Wallet Address
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleWalletVisibility}
                className="h-8 w-8"
              >
                {user?.walletAddress && showWalletAddress ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </Button>
            </div>
            <p className="mt-1 text-base font-mono">
              {user?.walletAddress
                ? showWalletAddress
                  ? user.walletAddress
                  : maskWalletAddress(user.walletAddress)
                : "No wallet connected"}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 items-start sm:items-center">
          <Button variant="outline">Change Password</Button>
          <Button variant="outline">
            {user?.walletAddress ? "Change Wallet" : "Connect Wallet"}
          </Button>
        </CardFooter>
      </Card>
      <Card className="shadow-sm max-w-4xl mx-6">
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>
            Manage your account security and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Account Deactivation</h3>
                <p className="text-sm text-gray-500">
                  Permanently remove your account and all associated data
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            <Separator />
            <Alert className="bg-amber-50 border-amber-200">
              <AlertDescription>
                To deactivate your account, please send an email to{" "}
                <span className="font-medium">support@metamuse.online</span>{" "}
                with the subject line "Account Deactivation Request".
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
