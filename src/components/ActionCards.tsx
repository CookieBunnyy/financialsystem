"use client";

import React, { useState } from "react";
import { CircleArrowDown, CircleArrowUp, PiggyBank, Wallet, X } from "lucide-react";
import API from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ActionCardsProps {
  walletId?: number;
  userId?: number;
  setCurrentPage?: (page: "dashboard" | "savings") => void;
  updateBalance?: (amt: number) => void;
  userName?: string;
  onTransactionComplete?: () => void;
}

interface CardProps {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}

function Card({ title, icon, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className="w-50 h-36 bg-white rounded-2xl border border-gray-100 shadow-sm font-bold text-center flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition"
    >
      <div className="text-4xl mb-2">{icon}</div>
      <div>{title}</div>
    </div>
  );
}

export default function ActionCards({
  walletId,
  userId,
  setCurrentPage,
  updateBalance,
  userName,
  onTransactionComplete,
}: ActionCardsProps) {
  const [modalOpen, setModalOpen] = useState<"Deposit" | "Withdraw" | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleTransaction = async (type: "Deposit" | "Withdraw") => {

    if ((!userId || userId <= 0) && (!walletId || walletId <= 0)) {
      setMessage({ type: "error", text: "User not authenticated or wallet missing." });
      console.error("[ActionCards] missing userId and walletId:", { userId, walletId });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setMessage({ type: "error", text: "Enter a valid amount" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
     
      const endpoint = userId && userId > 0
        ? `/wallets/user/${userId}/${type.toLowerCase()}`
        : `/wallets/${walletId}/${type.toLowerCase()}`;

      console.log(`[ActionCards] POST ${endpoint}`, { amount: numAmount, userId, walletId });

      const response = await API.post(endpoint, { amount: numAmount });
      console.log(`[ActionCards] ${type} success:`, response.data);

      updateBalance?.(type === "Deposit" ? numAmount : -numAmount);
      setMessage({ type: "success", text: `${type} successful!` });
      setModalOpen(null);
      setAmount("");
      onTransactionComplete?.();
    } catch (err: any) {
      console.error(`[ActionCards] ${type} error:`, {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
        url: err?.config?.url,
      });
      const errMsg = err?.response?.data?.error || err?.message || `Failed to ${type.toLowerCase()}`;
      setMessage({ type: "error", text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  const renderModal = () => {
    if (!modalOpen) return null;
    const type = modalOpen;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-xl w-80 relative">
          <button
            onClick={() => setModalOpen(null)}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          >
            <X size={20} />
          </button>
          <h3 className="text-xl font-bold mb-4">{type} Amount</h3>
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
          />
          <Button
            className="mt-4 w-full"
            onClick={() => handleTransaction(type)}
            disabled={loading}
          >
            {loading ? "Processing..." : "Submit"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-3xl text-violet-700 font-bold mb-2">Dashboard</h2>
      <p className="text-gray-600 mb-6">
        Welcome back{userName ? `, ${userName}` : ""} 👋
      </p>

      {message && (
        <div
          className={`p-2 mb-4 text-center rounded ${
            message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex gap-4 flex-wrap">
        <Card
          title="Deposit"
          icon={<CircleArrowDown size={32} className="text-blue-500" />}
          onClick={() => setModalOpen("Deposit")}
        />
        <Card
          title="Withdraw"
          icon={<CircleArrowUp size={32} className="text-green-500" />}
          onClick={() => setModalOpen("Withdraw")}
        />
        <Card
          title="Savings"
          icon={<PiggyBank size={32} className="text-pink-500" />}
          onClick={() => setCurrentPage?.("savings")}
        />
        <Card
          title="Budget"
          icon={<Wallet size={32} className="text-purple-500" />}
          onClick={() => console.log("Budget")}
        />
      </div>

      {renderModal()}
    </div>
  );
}
