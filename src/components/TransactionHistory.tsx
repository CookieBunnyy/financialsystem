"use client";

import React, { forwardRef, useImperativeHandle, useEffect, useState } from "react";
import API from "@/lib/api";

export interface TransactionRef {
  fetchTransactions: () => void;
}

interface TransactionHistoryProps {
  walletId: number;
}

interface Transaction {
  id: number;
  walletId: number;
  amount: number;
  type: string;
  createdAt: string;
}

const TransactionHistory = forwardRef<TransactionRef, TransactionHistoryProps>(
  ({ walletId }, ref) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showAll, setShowAll] = useState(false);

    const fetchTransactions = async () => {
      if (!walletId) return;

      try {
        setLoading(true);
        setError("");
        console.log(`[TransactionHistory] GET /wallets/${walletId}/transactions`);

        const res = await API.get(`/wallets/${walletId}/transactions`);
        setTransactions(res.data || []);
        console.log("[TransactionHistory] fetched:", res.data);
      } catch (err: any) {
        console.error("[TransactionHistory] fetch error:", {
          message: err?.message,
          status: err?.response?.status,
          data: err?.response?.data,
        });
        setError(err.response?.data?.error || err.message || "Failed to fetch transactions");
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({ fetchTransactions }));

    useEffect(() => {
      fetchTransactions();
    }, [walletId]);

    if (loading) return <div className="p-4">Loading transactions...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
      <div className="mt-8">
        <h2 className="text-xl text-violet-700 font-bold mb-4">Transaction History</h2>

        {transactions.length === 0 ? (
          <p className="text-gray-500">No transactions yet.</p>
        ) : (
          <div className="space-y-3">
            {(showAll ? transactions : transactions.slice(0, 5)).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between bg-white p-4 rounded-lg border"
              >
                <div>
                  <div className="font-semibold">{tx.type}</div>
                  <div className="text-sm text-gray-500">{new Date(tx.createdAt).toLocaleString()}</div>
                </div>
                <div className="font-bold">₱ {tx.amount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}

        {transactions.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-4 text-blue-600 hover:underline"
          >
            {showAll ? "Show Less" : "See More"}
          </button>
        )}
      </div>
    );
  }
);

TransactionHistory.displayName = "TransactionHistory";

export default TransactionHistory;
