"use client"

import { Button } from "@/components/ui/button";
import { useSecureTransaction } from "./useSecureTransaction";
import { getNewTransactionId } from "./useSecureTransaction";

const TransactionButton = ({ transactionType, transactionData, buttonText, setId }) => {
  const { initiateTransaction } = useSecureTransaction();

  const handleClick = async () => {
    const id = getNewTransactionId()
    await initiateTransaction(id, transactionType, transactionData);
    setId(id)
  };

  return (
    <Button
        variant={'outline'}
      onClick={handleClick}
      className="transition-all transition-200 active:scale-95"
    >
      {buttonText || 'Start Transaction'}
    </Button>
  );
};

export default TransactionButton;