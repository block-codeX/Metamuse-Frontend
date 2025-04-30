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
  );
};
