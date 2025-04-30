"use client";
import { useUserStore } from "@/lib/stores/user-store";
import { api } from "@/lib/utils";
import { useState, createContext, useContext, useEffect, useRef } from "react";
import { toast } from "sonner";
import { v4 } from "uuid";

// Create a context to share the auth state across components
const SecureTransactionContext = createContext(null);

export const getNewTransactionId = () => {
  return v4();
};

/**
 * Provides a secure transaction context for managing authentication and transaction flows.
 * This provider handles OTP requests, verification, and transaction updates.
 *
 * @component
 * @param {React.ReactNode} children - The child components to be wrapped by the provider.
 *
 * @context
 * - `isAuthModalOpen` (`boolean`): Indicates whether the authentication modal is open.
 * - `pendingTransaction` (`any`): The current transaction data being processed.
 * - `initiateTransaction` (`(tId: string, transactionType: string, transactionData: any) => Promise<void>`):
 *   Initiates a transaction by setting the transaction ID, type, and data, and opens the authentication modal.
 * - `handleAuthSuccess` (`(successMessage: string) => void`): Handles successful authentication by displaying a success message and canceling the transaction.
 * - `cancelTransaction` (`() => void`): Cancels the current transaction and resets the state.
 * - `requestOtp` (`() => Promise<void>`): Requests an OTP for the user via email.
 * - `setOTp` (`React.Dispatch<React.SetStateAction<string>>`): Updates the OTP value entered by the user.
 * - `otp` (`string`): The OTP entered by the user.
 * - `step` (`string`): The current step in the transaction process (e.g., "otp", "edit", "transact").
 * - `setStep` (`React.Dispatch<React.SetStateAction<string>>`): Updates the current step in the transaction process.
 * - `updateTransaction` (`(id: string, transactionData: any) => void`): Updates the transaction data if the transaction ID matches the current transaction.
 * - `transactionType` (`string | null`): The type of the current transaction.
 *   Sets the success function to be called after a successful transaction.
 *
 * @example
 * ```tsx
 * import { SecureTransactionProvider } from './useSecureTransaction';
 *
 * const App = () => (
 *   <SecureTransactionProvider>
 *     <YourComponent />
 *   </SecureTransactionProvider>
 * );
 * ```
 */
// Update your context type to include the new method
export interface SecureTransactionContextType {
  isAuthModalOpen: boolean;
  pendingTransaction: any;
  initiateTransaction: (
    tId: string,
    transactionType: string,
    transactionData: any
  ) => Promise<void>;
  handleAuthSuccess: (successMessage: string) => void;
  cancelTransaction: () => void;
  requestOtp: () => Promise<void>;
  setOTp: React.Dispatch<React.SetStateAction<string>>;
  otp: string;
  step: string;
  setStep: (step: string) => void;
  updateTransaction: (id: string, transactionData: any) => boolean;
  transactionType: string | null;
  handleTransaction: React.RefObject<((data: any) => Promise<void>) | null>;
  processTransaction: () => void; // New method
}
export const SecureTransactionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<any>(null);
  const [otpId, setOTPID] = useState<string | null>(null);
  const { user } = useUserStore();
  const [vToken, setVToken] = useState<string>("");
  const [otp, setOTp] = useState<string>("");
  const [step, setStep] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<string | null>(null);
  const handleTransaction = useRef(null);
  // Add a flag to track when transaction should be processed
  const [shouldProcessTransaction, setShouldProcessTransaction] =
    useState(false);

  const cancelTransaction = () => {
    setPendingTransaction(null);
    setIsAuthModalOpen(false);
    setOTPID(null);
    setOTp("");
    setStep("");
    setTransactionId(null);
    handleTransaction.current = null
    setShouldProcessTransaction(false); // Reset the processing flag
  };

  const requestOtp = async () => {
    try {
      const response = await api().post("/auth/otp/request", {
        email: user?.email,
        otpType: "EMAIL",
        multiUse: false,
      });
      if (response.status === 201) {
        console.log("OTP gotten");
        setOTPID(response.data.otp.otpId);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const initiateTransaction = async (
    tId: string,
    transactionType: string,
    transactionData: any
  ) => {
    setTransactionId(tId);
    setTransactionType(transactionType);
    setPendingTransaction(transactionData);
    setIsAuthModalOpen(true);
    setStep("otp");
    await requestOtp();
  };

  const updateTransaction = (id: string, transactionData: any) => {
    if (!transactionId || transactionId !== id) {
      cancelTransaction();
      return false;
    }
    setPendingTransaction(transactionData);
    return true;
  };

  const handleAuthSuccess = (successMessage: string) => {
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
      if (response.status === 201) {
        console.log(response.data);
        const verificationToken = response.data.result.verificationToken;
        setVToken(verificationToken);
        setStep("edit");
      }
    } catch (error) {
      console.error(error);
      toast.error("Invalid otp, please enter in the right value");
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

  // Separated the transaction processing logic into its own useEffect
  useEffect(() => {
    const processTransaction = async () => {
      if (
        !shouldProcessTransaction ||
        !pendingTransaction ||
        !handleTransaction.current ||
        !transactionId ||
        !vToken
      ) {
        return;
      }
      console.log("Processing transaction with OTP:", pendingTransaction);

      try {
        const { successMessage, ...data } = pendingTransaction;
        data.otpData = {
          verificationToken: vToken,
          otpId,
          otpType: "EMAIL",
        };

        console.log("Processing transaction:", data);
        await handleTransaction.current(data);
        handleAuthSuccess(
          successMessage || "Transaction completed successfully"
        );
      } catch (error) {
        console.error("Transaction processing error:", error);
        toast.error("Something went wrong");
        cancelTransaction();
      } finally {
        setShouldProcessTransaction(false);
      }
    };

    processTransaction();
  }, [
    shouldProcessTransaction,
    pendingTransaction,
    handleTransaction.current,
    transactionId,
    vToken,
  ]);

  // New method to trigger transaction processing
  const processTransaction = () => {
    if (!pendingTransaction || !handleTransaction.current || !transactionId) {
      toast.error("Transaction data is incomplete");
      return;
    }
    setShouldProcessTransaction(true);
  };

  // Modified to use the new process transaction method
  const setStepAndProcess = (newStep: string) => {
    setStep(newStep);
    if (newStep === "transact") {
      processTransaction();
    }
  };

  const value: SecureTransactionContextType = {
    isAuthModalOpen,
    pendingTransaction,
    initiateTransaction,
    handleAuthSuccess,
    cancelTransaction,
    requestOtp,
    setOTp,
    otp,
    step,
    setStep: setStepAndProcess, // Replace with enhanced version
    updateTransaction,
    transactionType,
    processTransaction, // Expose the new method
    handleTransaction,
  };

  return (
    <SecureTransactionContext.Provider value={value as any}>
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
  return context as SecureTransactionContextType;
};
