"use client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useUserStore } from "@/lib/stores/user-store";
import { api } from "@/lib/utils";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

const OTPComponent = () => {
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [isCounting, setIsCounting] = useState(false);
  const router = useRouter()
  useEffect(() => {
    if (isCounting && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setIsCounting(false);
    }
  }, [countdown, isCounting]);
  const { fetchUser, user } =  useUserStore()
  const { email, otpId } = JSON.parse(localStorage.getItem("otp") || "{}")

  // Automatically log OTP when fully entered
  useEffect(() => {
    const verify = async () => {
      if (otp.length === 6) {
        console.log("OTP Entered:", otp);
        await verifyOtp()
      }
    }
    verify()
  }, [otp]);

    const requestOtp = async (email: string) => {
      try {
        const response = await api().post("/auth/otp/request", {
          email,
          otpType: "EMAIL",
          multiUse: false,
        });
          if (response.status == 201) {
            console.log(response.data)
            localStorage.setItem("otp", JSON.stringify({ otpId: response.data.otp.otpId, email}))
     }
      } catch (error) {
        console.error(error)
      }
    };
    const verifyUser = async (verificationToken: any) => {
      try {
        const response = await api().post("/auth/account/verify", {
          email: user?.email, otpData: { otpId, otpType: "EMAIL", verificationToken }
        });
        if (response.status == 201) {
          console.log(response.data)
          await fetchUser()
          toast.success("Verification successful. Proceed to log in")
          router.push("/auth/login")
        }
      } catch (error) {
        console.error(error)
      }
    }
    
  const handleResend = async () => {
    setOtp("");
    setCountdown(60);
    setIsCounting(true);
    console.log("Resend OTP");
    await requestOtp((user?.email) as string)
  };
   const verifyOtp = async () => {
      try {
        const response = await api().post("/auth/otp/verify", {
          otp,
          otpType: "EMAIL",
          otpId
        });
        if (response.status == 201) {
          console.log(response.data)
          const verificationToken = response.data.result.verificationToken
          await verifyUser(verificationToken)
        }
      } catch (error) {
        console.error(error)
      } finally {
        localStorage.removeItem("otp")
      }
    };
  // Handle resend OTP
  


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
