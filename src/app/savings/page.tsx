"use client";

import { useState, useEffect } from "react";
import { Plus, ArrowRightLeft } from "lucide-react";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ----------------------
// TypeScript interfaces
// ----------------------
interface Savings {
  id: number;
  wallet_id: number;
  amount: number;
  description?: string;
  created_at: string;
}

interface Wallet {
  id: number;
  user_id: number;
  balance: number;
}

interface PageProps {
  walletId?: number;
  savingsHistory?: Savings[];
  onSavingsUpdate?: () => void;
}

// ----------------------
// Backend base URL
// ----------------------
const baseURL = "http://localhost:8080/api";

export default function SavingsPage({ walletId: propWalletId, savingsHistory: propSavingsHistory, onSavingsUpdate }: PageProps) {
  const [walletId, setWalletId] = useState<number | null>(propWalletId ?? null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [savings, setSavings] = useState<Savings[]>([]);
  const [addModal, setAddModal] = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // ----------------------
  // Fetch wallet & savings
  // ----------------------
  useEffect(() => {
    if (!walletId) return;
    fetchWallet();
    fetchSavings();
  }, [walletId]);

  useEffect(() => {
    if (propSavingsHistory && propSavingsHistory.length > 0) {
      setSavings(propSavingsHistory);
      setIsFetching(false);
    }
  }, [propSavingsHistory]);

  const fetchWallet = async () => {
    if (!walletId) return;
    try {
      const res = await axios.get<Wallet>(`${baseURL}/wallets/${walletId}`);
      setWallet(res.data);
      setErrorMessage("");
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "Failed to fetch wallet");
    }
  };

  const fetchSavings = async () => {
    if (!walletId) return;
    setIsFetching(true);
    try {
      const res = await axios.get<Savings[]>(`${baseURL}/savings/${walletId}`);
      setSavings(res.data);
      setErrorMessage("");
    } catch (err: any) {
      console.error("[SavingsPage] fetchSavings error:", err);
      setSavings([]);
      setErrorMessage(""); // ignore 404
    } finally {
      setIsFetching(false);
    }
  };

  // ----------------------
  // Add savings
  // ----------------------
  const handleAddSavings = async () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) return alert("Enter a valid amount");
    if (!walletId) return;

    setIsLoading(true);
    try {
      const res = await axios.post<Savings>(`${baseURL}/savings/${walletId}/add`, null, {
        params: { amount: value, description },
      });
      setSavings([...savings, res.data]);
      fetchWallet();
      onSavingsUpdate?.();
      setAddModal(false);
      setAmount("");
      setDescription("");
    } catch (err: any) {
      console.error("[SavingsPage] handleAddSavings error:", err);
      setErrorMessage(err.response?.data?.message || "Failed to add savings");
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------
  // Transfer savings
  // ----------------------
  const totalSavings = savings.reduce((sum, s) => sum + s.amount, 0);

  const handleTransfer = async () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) return alert("Enter a valid amount");
    if (!walletId) return;
    if (value > totalSavings) return alert("Insufficient savings amount");

    setIsLoading(true);
    try {
      await axios.post(`${baseURL}/savings/transfer`, null, {
        params: { wallet_id: walletId, amount: value },
      });
      fetchWallet();
      fetchSavings();
      onSavingsUpdate?.();
      setTransferModal(false);
      setAmount("");
    } catch (err: any) {
      console.error("[SavingsPage] handleTransfer error:", err);
      setErrorMessage(err.response?.data?.message || "Failed to transfer");
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------
  // UI
  // ----------------------
  return (
    <div className="px-50 py-10 w-232 h-50 bg-gray-100 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-violet-700 mb-4">Savings</h1>

      {errorMessage && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded w-[380px]">{errorMessage}</div>}

      {/* Total savings */}
      <div className="bg-white shadow-md rounded-2xl p-6 w-[380px] border border-gray-100 mb-4">
        <div className="text-gray-500 text-sm">Total Savings</div>
        <div className="text-3xl font-bold text-violet-700 mt-2">₱{totalSavings.toLocaleString()}</div>
      </div>

      {/* Savings list */}
      <div className="w-[380px] flex flex-col gap-3 mb-4">
        {isFetching ? (
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center text-gray-500">Loading savings...</div>
        ) : savings.length === 0 ? (
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center text-gray-500">No savings yet.</div>
        ) : (
          savings.map(s => (
            <div key={s.id} className="bg-white rounded-xl p-4 border border-gray-100 flex justify-between items-center">
              <div>
                <div className="text-gray-500 text-sm">{s.description || "No description"}</div>
                <div className="font-bold text-violet-700">₱{s.amount.toLocaleString()}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <Button className="flex items-center gap-2" onClick={() => setAddModal(true)}>
          <Plus className="w-5 h-5" /> Add
        </Button>
        <Button className="flex items-center gap-2" variant="secondary" onClick={() => setTransferModal(true)}>
          <ArrowRightLeft className="w-5 h-5" /> Transfer
        </Button>
      </div>

      {/* Add Modal */}
      <Dialog open={addModal} onOpenChange={setAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Savings</DialogTitle>
            <DialogDescription>Enter the amount and description for your savings.</DialogDescription>
          </DialogHeader>

          <Input type="number" placeholder="Amount (₱)" value={amount} onChange={e => setAmount(e.target.value)} className="mt-4" />
          <Input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="mt-4" />

          <Button className="w-full mt-4" onClick={handleAddSavings} disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Transfer Modal */}
      <Dialog open={transferModal} onOpenChange={setTransferModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer From Savings</DialogTitle>
            <DialogDescription>Enter the amount you want to transfer back to your wallet.</DialogDescription>
          </DialogHeader>

          <Input type="number" placeholder="Amount (₱)" value={amount} onChange={e => setAmount(e.target.value)} className="mt-4" />

          <Button className="w-full mt-4" onClick={handleTransfer} disabled={isLoading}>
            {isLoading ? "Transferring..." : "Transfer"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
