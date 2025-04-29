"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// The expected OTP code
const CORRECT_OTP = "123456";

export default function AuthFlowModal({ isOpen, onClose, target }) {
  const [step, setStep] = useState("otp"); // "otp" | "edit"
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
    walletAddress: "",
    confirmWalletAddress: "",
  });

  const handleOtpSubmit = () => {
    setIsSubmitting(true);
    
    // Simulate API verification delay
    setTimeout(() => {
      // For demo purposes, accept any 6-digit OTP
      if (otp.length === 6) {
        setStep("edit");
        toast.success("OTP verified successfully");
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
      setIsSubmitting(false);
    }, 1000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = () => {
    setIsSubmitting(true);
    
    // Validation
    if (target === "password") {
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
    } else if (target === "wallet") {
      if (formData.walletAddress !== formData.confirmWalletAddress) {
        toast.error("Wallet addresses do not match");
        setIsSubmitting(false);
        return;
      }
      
      // Basic Ethereum address validation
      const walletRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!walletRegex.test(formData.walletAddress)) {
        toast.error("Please enter a valid Ethereum address");
        setIsSubmitting(false);
        return;
      }
    }
    
    // Simulate API call delay
    setTimeout(() => {
      toast.success(
        target === "password" 
          ? "Password changed successfully" 
          : "Wallet connected successfully"
      );
      
      // Reset and close
      setStep("otp");
      setOtp("");
      setFormData({
        password: "",
        confirmPassword: "",
        walletAddress: "",
        confirmWalletAddress: "",
      });
      onClose();
      setIsSubmitting(false);
    }, 1500);
  };

  const handleClose = () => {
    // Reset state when closing
    setStep("otp");
    setOtp("");
    setFormData({
      password: "",
      confirmPassword: "",
      walletAddress: "",
      confirmWalletAddress: "",
    });
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {step === "otp" ? (
              "Verification Required"
            ) : target === "password" ? (
              "Change Password"
            ) : (
              "Connect Wallet"
            )}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {step === "otp" ? (
              "Please enter the 6-digit verification code to continue."
            ) : target === "password" ? (
              "Enter your new password below."
            ) : (
              "Enter your wallet address below."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {step === "otp" ? (
          <div className="flex flex-col items-center py-4 space-y-4">
            <InputOTP 
              maxLength={6} 
              value={otp} 
              onChange={setOtp}
              className="justify-center"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <Button 
              onClick={handleOtpSubmit} 
              disabled={otp.length !== 6 || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </div>
        ) : target === "password" ? (
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
              disabled={!formData.password || !formData.confirmPassword || isSubmitting}
              className="w-full"
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
        ) : (
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="walletAddress">Wallet Address</Label>
              <Input
                id="walletAddress"
                name="walletAddress"
                value={formData.walletAddress}
                onChange={handleInputChange}
                placeholder="0x..."
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmWalletAddress">Confirm Wallet Address</Label>
              <Input
                id="confirmWalletAddress"
                name="confirmWalletAddress"
                value={formData.confirmWalletAddress}
                onChange={handleInputChange}
                placeholder="0x..."
                className="font-mono"
              />
            </div>
            <Button 
              onClick={handleFormSubmit} 
              disabled={!formData.walletAddress || !formData.confirmWalletAddress || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Wallet"
              )}
            </Button>
          </div>
        )}

        <AlertDialogFooter className="sm:justify-start">
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}