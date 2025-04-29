"use client";

import React, { useEffect, useState } from "react";
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
import { useSecureTransaction } from "./useSecureTransaction";
import { ChangePassword } from "./profile-update";
import { string } from "zod";
import { api } from "@/lib/utils";

interface IPreset {
  title: string;
  description: string;
  element: React.ReactElement;
  successFn: (data: any) => Promise<void>;
}
const presets = {
  password: {
    title: "Change your password",
    description: "Enter in your new password below",
    element: ChangePassword,
    successFn: async (data) => {
      try {
        await api(true).post("/auth/password/reset", data);
      } catch (error) {
        console.error(error);
      }
    },
  },
};

export const OTPGuardFlow = ({ tId }) => {
  const {
    isAuthModalOpen,
    step,
    transactionType,
    setStep,
    cancelTransaction,
    requestOtp,
    setOTp,
    setSuccessFn,
    otp,
  } = useSecureTransaction();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCounting, setIsCounting] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    console.log("Auth", isAuthModalOpen);
    setSuccessFn(presets[transactionType]?.successFn);
  }, [isAuthModalOpen]);

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
          transactionType && React.cloneElement(
            presets[transactionType].element as React.ReactElement,
            { transactionId: tId }
          )
        )}

        <AlertDialogFooter className="sm:justify-start">
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
export default OTPGuardFlow;
