"use client";
import { useUserStore } from "@/lib/stores/user-store";
import { api } from "@/lib/utils";
import { useState, createContext, useContext, useEffect } from "react";
import { toast } from "sonner";
import { v4 } from "uuid";

// Create a context to share the auth state across components
const SecureTransactionContext = createContext(null);

export const getNewTransactionId = () => {
  return v4();
};

// Provider component that will wrap your app
export const SecureTransactionProvider = ({ children }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const [otpId, setOTPID] = useState(null);
  const { user } = useUserStore();
  const [vToken, setVToken] = useState("");
  const [otp, setOTp] = useState("");
  const [step, setStep] = useState("");
  const [transactionId, setTransactionId] = useState(null);
  const [transactionType, setTransactionType] = useState(null);
  const [successFn, setSuccessFn] = useState(null);

  const cancelTransaction = () => {
    setPendingTransaction(null);
    setIsAuthModalOpen(false);
    setOTPID(null);
    setOTp("");
    setStep("");
    setTransactionId(null);
  };
  const requestOtp = async () => {
    try {
      const response = await api().post("/auth/otp/request", {
        email: user?.email,
        otpType: "EMAIL",
        multiUse: false,
      });
      if (response.status == 201) {
        console.log("OTP gotten");
        setOTPID(response.data.otp.otpId);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const initiateTransaction = async (tId, transactionType, transactionData) => {
    setTransactionId(tId);
    setTransactionType(transactionType);
    setPendingTransaction(transactionData);
    setIsAuthModalOpen(true);
    setStep("otp");
    await requestOtp();
  };

  const updateTransaction = (id, transactionData: any) => {
    if (!transactionId || transactionId !== id) {
      cancelTransaction();
    }
    setPendingTransaction(transactionData);
  };
  const handleAuthSuccess = (successMessage) => {
    toast.success(successMessage);
    cancelTransaction();
  };
  const verifyOtp = async () => {
    try {
      const response = await api().post("/auth/otp/verify", {
        otp,
        otpType: "EMAIL",
        otpId,
      });
      if (response.status == 201) {
        console.log(response.data);
        const verificationToken = response.data.result.verificationToken;
        setVToken(verificationToken);
        setStep("edit");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      localStorage.removeItem("otp");
    }
  };
  useEffect(() => {
    const verify = async () => {
      if (otp.length === 6) {
        console.log("OTP Entered:", otp);
        await verifyOtp();
      }
    };
    verify();
  }, [otp]);
  useEffect(() => {
    requestOtp();
  }, []);

  useEffect(() => {
    const succeed = async () => {
      if (!pendingTransaction) return;
      const { successMessage, ...data } = pendingTransaction;
      if (step == "transact") {
        if (!data) {
          toast.error("Something went wrong. Try again later");
          cancelTransaction();
        }

        data.otpData = {
          verificationToken: vToken,
          otpId,
          otpType: "EMAIL",
        };
        await successFn(data);
        handleAuthSuccess(successMessage);
      }
    };
    succeed();
  }, [pendingTransaction]);

  const value = {
    isAuthModalOpen,
    pendingTransaction,
    initiateTransaction,
    handleAuthSuccess,
    cancelTransaction,
    requestOtp,
    setOTp,
    otp,
    step,
    setStep,
    updateTransaction,
    transactionType,
    setSuccessFn,
  };

  return (
    <SecureTransactionContext.Provider value={value}>
      {children}
    </SecureTransactionContext.Provider>
  );
};

// Hook for components to use the auth context
export const useSecureTransaction = () => {
  const context = useContext(SecureTransactionContext);
  if (!context) {
    throw new Error(
      "useSecureTransaction must be used within a SecureTransactionProvider"
    );
  }
  return context;
};
