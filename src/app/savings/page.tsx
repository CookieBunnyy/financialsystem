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
  // Get walletId from prop, localStorage, or URL params
  const [walletId, setWalletId] = useState<number | null>(propWalletId ?? null);
  const [userId, setUserId] = useState<number | null>(null);

  // ----------------------
  // States
  // ----------------------
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [savings, setSavings] = useState<Savings[]>([]);
  const [addModal, setAddModal] = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  const [selectedSavingsId, setSelectedSavingsId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // ----------------------
  // Helpers with fallback for 404
  // ----------------------
  const getWithFallback = async <T,>(primary: string, fallback?: string) => {
    try {
      const res = await axios.get<T>(primary);
      return res.data;
    } catch (err: any) {
      if (err?.response?.status === 404 && fallback) {
        const res = await axios.get<T>(fallback);
        return res.data;
      }
      throw err;
    }
  };

  const postWithFallback = async <T,>(primary: string, body: any, fallback?: { url: string; body?: any }) => {
    try {
      const res = await axios.post<T>(primary, body, { headers: { "Content-Type": "application/json" } });
      return res.data;
    } catch (err: any) {
      if (err?.response?.status === 404 && fallback) {
        const res = await axios.post<T>(fallback.url, fallback.body ?? body, { headers: { "Content-Type": "application/json" } });
        return res.data;
      }
      throw err;
    }
  };

  // ----------------------
  // Fetch wallet & savings (use fallback variants)
  // ----------------------
  useEffect(() => {
    const initializeWalletId = async () => {
      // First, try prop
      if (propWalletId) {
        setWalletId(propWalletId);
        return;
      }

      // Get userId from localStorage (set during login)
      const storedUserId = localStorage.getItem("userId");
      if (!storedUserId) {
        console.error("[SavingsPage] No userId in localStorage");
        return;
      }

      setUserId(parseInt(storedUserId));

      // Fetch user's wallet (same as DashboardPage does)
      try {
        const res = await axios.get(`${baseURL}/wallets/user/${storedUserId}`);
        const wallet = res.data;
        setWalletId(wallet.id ?? wallet.walletId ?? 1);
        console.log("[SavingsPage] Fetched walletId:", wallet.id ?? wallet.walletId);
      } catch (err) {
        console.error("[SavingsPage] Failed to fetch wallet for user:", err);
        // Fallback to localStorage walletId if available
        const storedWalletId = localStorage.getItem("walletId");
        if (storedWalletId) {
          setWalletId(parseInt(storedWalletId));
        }
      }
    };

    initializeWalletId();
  }, [propWalletId]);

  useEffect(() => {
    if (walletId) {
      fetchWallet();
      fetchSavings();
    }
  }, [walletId]);

  // Use prop data if available, otherwise fetch
  useEffect(() => {
    if (propSavingsHistory && propSavingsHistory.length > 0) {
      setSavings(propSavingsHistory);
      setIsFetching(false);
    }
  }, [propSavingsHistory]);

  const fetchWallet = async () => {
    if (!walletId) return;
    try {
      const primary = `${baseURL}/wallets/${walletId}`;
      const fallback = `${baseURL}/wallets?id=${walletId}`;
      const data = await getWithFallback<Wallet>(primary, fallback);
      setWallet(data);
      setErrorMessage("");
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "Failed to fetch wallet");
    }
  };

  const fetchSavings = async () => {
    if (!walletId) return;
    setIsFetching(true);
    try {
      console.log("[SavingsPage] Fetching savings for walletId:", walletId);
      const primary = `${baseURL}/savings/${walletId}`;
      const fallback = `${baseURL}/savings?wallet_id=${walletId}`;
      const data = await getWithFallback<Savings[]>(primary, fallback);
      setSavings(data);
      setErrorMessage("");
    } catch (err: any) {
      console.error("[SavingsPage] fetchSavings error:", {
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
      });
      // Set empty savings list on 404 (endpoint not found or no data)
      if (err?.response?.status === 404) {
        setSavings([]);
        setErrorMessage(""); // Don't show error, just empty state
      } else {
        setErrorMessage(err.response?.data?.message || "Failed to fetch savings");
      }
    } finally {
      setIsFetching(false);
    }
  };

  // ----------------------
  // Add savings (deduct wallet balance)
  // ----------------------
  const handleAddSavings = async () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) return alert("Enter a valid amount");

    setIsLoading(true);
    try {
      console.log("[SavingsPage] Adding savings:", { walletId, amount: value, description, selectedSavingsId });

      // If user selected an existing savings, try to add to it
      if (selectedSavingsId) {
        try {
          const url = `${baseURL}/savings/${selectedSavingsId}/add?amount=${value}${description ? `&description=${encodeURIComponent(description)}` : ""}`;
          const res = await axios.post<Savings>(url);
          const updated = res.data;
          // update local savings amount (if backend returns updated record)
          setSavings(savings.map(s => s.id === selectedSavingsId ? { ...s, amount: (updated.amount ?? s.amount + value) } : s));
          await fetchWallet();
          onSavingsUpdate?.();
          setAddModal(false);
          setAmount("");
          setDescription("");
          setErrorMessage("");
          return;
        } catch (err: any) {
          // if endpoint not found, fall through to create-new behaviour below
          console.warn("[SavingsPage] add to existing savings failed, will try create new:", err?.response?.status);
          if (err?.response?.status !== 404) throw err;
        }
      }

      // Create new savings (existing behavior)
      const url = `${baseURL}/savings/${walletId}/add?amount=${value}${description ? `&description=${encodeURIComponent(description)}` : ""}`;
      const res = await axios.post<Savings>(url);
      const saved = res.data;

      setSavings([...savings, saved]);
      await fetchWallet();
      onSavingsUpdate?.();
      setAddModal(false);
      setAmount("");
      setDescription("");
      setErrorMessage("");
    } catch (err: any) {
      console.error("[SavingsPage] handleAddSavings error:", {
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
        url: err?.config?.url,
      });

      // Retry with POST /savings body as fallback (existing retry logic)
      if (err?.response?.status === 404) {
        try {
          const value = parseFloat(amount);
          const res = await axios.post<Savings>(`${baseURL}/savings`, {
            wallet_id: walletId,
            amount: value,
            description: description || null,
          });
          const saved = res.data;
          setSavings([...savings, saved]);
          await fetchWallet();
          onSavingsUpdate?.();
          setAddModal(false);
          setAmount("");
          setDescription("");
          setErrorMessage("");
          return;
        } catch (retryErr: any) {
          console.error("[SavingsPage] Retry with POST /savings failed:", retryErr);
        }
      }

      setErrorMessage(err.response?.data?.message || "Failed to add savings");
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------
  // Transfer savings back to wallet
  // ----------------------
  const handleTransfer = async () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) return alert("Enter a valid amount");
    if (value > totalSavings) return alert("Insufficient savings amount");

    setIsLoading(true);
    try {
     // Deduct from all savings (or create a general transfer endpoint)
     const url = `${baseURL}/savings/transfer?wallet_id=${walletId}&amount=${value}`;
     await axios.post<Wallet>(url);

      await fetchSavings();
      await fetchWallet();

      onSavingsUpdate?.();
      setTransferModal(false);
      setAmount("");
      setErrorMessage("");
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "Failed to transfer");
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------
  // Calculate total savings
  // ----------------------
  const totalSavings = savings.reduce((sum, s) => sum + s.amount, 0);

  // ----------------------
  // UI
  // ----------------------
  return (
    <div className="px-50 py-10 w-232 h-50 bg-gray-100 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-violet-700 mb-4">Savings</h1>

      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-2 mb-4 rounded w-[380px]">
          {errorMessage}
        </div>
      )}

      {/* Total savings */}
      <div className="bg-white shadow-md rounded-2xl p-6 w-[380px] border border-gray-100 mb-4">
        <div className="text-gray-500 text-sm">Total Savings</div>
        <div className="text-3xl font-bold text-violet-700 mt-2">₱{totalSavings.toLocaleString()}</div>
      </div>

      {/* Savings list */}
      <div className="w-[380px] flex flex-col gap-3 mb-4">
        {isFetching ? (
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center text-gray-500">
            Loading savings...
          </div>
        ) : savings.length === 0 ? (
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center text-gray-500">
            No savings yet. Start by adding your first savings!
          </div>
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

      {/* Add Savings Modal */}
      <Dialog open={addModal} onOpenChange={setAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Savings</DialogTitle>
            <DialogDescription>Enter the amount and description for your savings.</DialogDescription>
          </DialogHeader>

          {/* select existing savings or create new */}
          <select
            className="mt-2 p-2 border rounded w-full"
            value={selectedSavingsId ?? ""}
            onChange={e => {
              const v = e.target.value;
              setSelectedSavingsId(v ? parseInt(v, 10) : null);
            }}
          >
            <option value="">Create new savings</option>
            {savings.map(s => (
              <option key={s.id} value={s.id}>
                {s.description || "No description"} - ₱{s.amount.toLocaleString()}
              </option>
            ))}
          </select>

          <Input type="number" placeholder="Amount (₱)" value={amount} onChange={e => setAmount(e.target.value)} className="mt-4" />
          <Input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="mt-4" />

          <Button className="w-full mt-4" onClick={handleAddSavings} disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Transfer Savings Modal */}
      <Dialog open={transferModal} onOpenChange={setTransferModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer From Savings</DialogTitle>
            <DialogDescription>Enter the amount you want to transfer back to your wallet.</DialogDescription>
          </DialogHeader>

          <Input type="number" placeholder="Amount (₱)" value={amount} onChange={e => setAmount(e.target.value)} className="mt-4"/>

          <Button className="w-full mt-4" onClick={handleTransfer} disabled={isLoading}>
            {isLoading ? "Transferring..." : "Transfer"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
