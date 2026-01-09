"use client";

import React, { useRef } from "react";
import ActionCards from "./ActionCards";
import SavingsPage from "@/app/savings/page";
import TransactionHistory, { TransactionRef } from "./TransactionHistory";

interface SavingsTransaction {
  id: number;
  wallet_id: number;
  amount: number;
  description?: string;
  created_at: string;
}

interface MainContentProps {
  currentPage: "dashboard" | "savings";
  setCurrentPage: React.Dispatch<React.SetStateAction<"dashboard" | "savings">>;
  balance: number;
  updateBalance: (amt: number) => Promise<void> | void;
  walletId: number;
  userId?: number;
  userName: string;
  savingsHistory: SavingsTransaction[];
  onSavingsUpdate?: () => void;
}

export default function MainContent({
  currentPage,
  setCurrentPage,
  balance,
  updateBalance,
  walletId,
  userId,
  userName = "User",
  savingsHistory,
  onSavingsUpdate,
}: MainContentProps) {
  const txRef = useRef<TransactionRef>(null);

  return (
    <div className="flex flex-col w-232 gap-6">
      {currentPage === "dashboard" && (
        <>
          <ActionCards
            userId={userId}
            walletId={walletId}
            userName={userName}
            setCurrentPage={setCurrentPage}
            onTransactionComplete={() => txRef.current?.fetchTransactions()}
            updateBalance={updateBalance}
          />
          <TransactionHistory ref={txRef} walletId={walletId} />
        </>
      )}

      {currentPage === "savings" && (
        <SavingsPage
          walletId={walletId}
          savingsHistory={savingsHistory}
          onSavingsUpdate={onSavingsUpdate}
        />
      )}
    </div>
  );
}
