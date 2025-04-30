"use client"

import { Button } from "@/components/ui/button";
import { useSecureTransaction } from "./useSecureTransaction";
import { getNewTransactionId } from "./useSecureTransaction";
import React from "react";

const TransactionButton = ({ transactionType, transactionData, buttonText, setId, icon, iconOnly, classes, variant }) => {
  const { initiateTransaction } = useSecureTransaction();

  const handleClick = async () => {
    const id = getNewTransactionId()
    await initiateTransaction(id, transactionType, transactionData);
    setId(id)
  };

  if (iconOnly) {
    return (
      <Button
        variant={'ghost'}
        onClick={handleClick}
        className="transition-all transition-200 active:scale-95"
      >
        {icon}
      </Button>
    );
  }

  return (
    <Button
        variant={variant || 'default'}
      onClick={handleClick}
      className={`transition-all transition-200 active:scale-95 ${classes}`}
    >
      {icon && React.createElement(icon)}
      {buttonText || 'Start Transaction'}
    </Button>
  );
};

export default TransactionButton;