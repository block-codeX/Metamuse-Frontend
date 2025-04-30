"use client";

import React, { FC, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
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
import { useSecureTransaction } from "./useSecureTransaction";
import { ChangePassword, NewWallet } from "./profile-update";

interface IPreset {
  title: string;
  description: string;
  element: React.ComponentType<{ transactionId: string }>;
}
const presets: Record<string, IPreset> = {
  password: {
    title: "Change your password",
    description: "Enter in your new password below",
    element: ChangePassword,
  },
  connect: {
    title: "Create a new wallet",
    description: "Add a new wallet to manage your assets",
    element: NewWallet,
  }
};

export const OTPGuardFlow: FC<{tId: string}> = ({ tId }) => {
  const {
    isAuthModalOpen,
    step,
    transactionType,
    setStep,
    cancelTransaction,
    requestOtp,
    setOTp,
    otp,
  } = useSecureTransaction();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCounting, setIsCounting] = useState(false);
  const [countdown, setCountdown] = useState(60);


  const handleResend = async () => {
    setCountdown(60);
    setIsCounting(true);
    setOTp("");
    console.log("Resend OTP");
    await requestOtp();
  };
  useEffect(() => {
    if (isCounting && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setIsCounting(false);
    }
  }, [countdown, isCounting]);  
  return (
    <AlertDialog open={isAuthModalOpen} onOpenChange={cancelTransaction}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {step === "otp"
              ? "Verification Required"
              : presets[transactionType]?.title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {step === "otp"
              ? "Please enter the 6-digit verification code to continue."
              : presets[transactionType]?.description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {step === "otp" ? (
          <div className="flex flex-col items-center py-4 space-y-4">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOTp}
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
              //   onClick={handleOtpSubmit}
              //   disabled={otp.length !== 6 || isSubmitting}
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
            {isCounting ? (
              <p className="text-sm text-gray-500">
                Resend OTP in {countdown} seconds
              </p>
            ) : (
              <Button variant="ghost" onClick={handleResend}>
                Resend OTP
              </Button>
            )}
          </div>
        ) : (
            transactionType && React.createElement(presets[transactionType].element, { transactionId: tId })
        )}
        <AlertDialogFooter className="sm:justify-start">
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
export default OTPGuardFlow;
