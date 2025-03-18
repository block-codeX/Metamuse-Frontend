"use client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import React, { useState, useEffect } from "react";

const OTPComponent = () => {
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [isCounting, setIsCounting] = useState(false);

  // Handle countdown logic
  useEffect(() => {
    if (isCounting && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setIsCounting(false);
    }
  }, [countdown, isCounting]);

  // Automatically log OTP when fully entered
  useEffect(() => {
    if (otp.length === 6) {
      console.log("OTP Entered:", otp);
    }
  }, [otp]);

  // Handle resend OTP
  const handleResend = () => {
    setOtp("");
    setCountdown(60);
    setIsCounting(true);
    console.log("Resend OTP");
  };

  return (
    <div className="flex flex-col h-20 items-center">

          <Card className="w-full  p-4 m-4 bg-background dark:bg-background text-text-pri dark:text-text-alt">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl my-3 font-bold text-center flex flex-col items-center space-y-4">
          <span>Verify your account</span>
          <p className="font-normal text-sm">Enter the otp that was sent to your email</p>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4 justify-center">
      <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
        <InputOTPGroup className="flex flex-row justify-center space-x-2">
          {[...Array(3)].map((_, index) => (
            <InputOTPSlot className="h-12 w-12 rounded-full border" key={index} index={index} />
          ))}
          <InputOTPSeparator />
          {[...Array(3)].map((_, index) => (
            <InputOTPSlot className="h-12 w-12  rounded-full border" key={index + 3} index={index + 3} />
        ))}
        </InputOTPGroup>
      </InputOTP>

      {isCounting ? (
        <p className="text-sm text-gray-500">
          Resend OTP in {countdown} seconds
        </p>
      ) : (
        <Button variant="ghost" onClick={handleResend}>
          Resend OTP
        </Button>
      )}
      </CardContent>
    </Card>
    </div>
  );
};

export default OTPComponent;
