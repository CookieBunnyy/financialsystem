"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import RightPanel from "@/components/RightPanel";
import API from "@/lib/api";

interface SavingsTransaction {
  id: number;
  wallet_id: number;
  amount: number;
  description?: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<"dashboard" | "savings">("dashboard");
  const [balance, setBalance] = useState<number>(0);
  const [walletId, setWalletId] = useState<number | null>(null);
  const [username, setUsername] = useState<string>("User");
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingsHistory, setSavingsHistory] = useState<SavingsTransaction[]>([]);

  useEffect(() => {
    const fetchUserAndWallet = async () => {
      const storedUserId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!storedUserId) {
        router.push("/login");
        return;
      }

      setUserId(parseInt(storedUserId));

      if (token) API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      try {
        try {
          const userRes = await API.get("/auth/me", { params: { userId: storedUserId } });
          setUsername(userRes.data.username ?? "User");
        } catch { /* ignore if not implemented */ }

        let wallet = null;
        try {
          const res = await API.get(`/wallets/user/${storedUserId}`);
          wallet = res.data;
        } catch { /* ignore */ }

        if (!wallet) {
          try {
            const createRes = await API.post("/wallets", { userId: parseInt(storedUserId), balance: 0 });
            wallet = createRes.data;
          } catch (e) {
            console.error("[DashboardPage] Wallet creation failed:", e);
            wallet = { id: 1, balance: 0, walletId: 1 };
          }
        }

        setBalance(wallet.balance ?? 0);
        setWalletId(wallet.id ?? wallet.walletId ?? 1);

        // Fetch savings history
        await fetchSavingsHistory(wallet.id ?? wallet.walletId ?? 1);
      } catch (err: any) {
        console.error("[DashboardPage] fetchUserAndWallet error:", err?.response ?? err);
        setUsername("User");
        setBalance(0);
        setWalletId(1);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndWallet();
  }, [router]);

  const fetchSavingsHistory = async (id: number) => {
    try {
      const res = await API.get(`http://localhost:8080/api/savings/${id}`);
      setSavingsHistory(res.data || []);
      console.log("[DashboardPage] Fetched savings history:", res.data);
    } catch (err) {
      console.error("[DashboardPage] Failed to fetch savings history:", err);
      setSavingsHistory([]);
    }
  };

  const updateBalance = async (amt: number) => {
    if (!walletId || !userId) return;

    // Note: Balance updates are handled by the backend through savings/transfer endpoints.
    // Do not call PUT /wallets directly as the backend does not support it.
    console.log("[DashboardPage] Balance update handled by savings operations");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar setCurrentPage={setCurrentPage} />
      <main className="flex-1 p-6 overflow-y-auto">
        <MainContent
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          balance={balance}
          updateBalance={updateBalance}
          walletId={walletId ?? 0}
          userId={userId ?? undefined}  
          userName={username}
          savingsHistory={savingsHistory}
          onSavingsUpdate={() => walletId && fetchSavingsHistory(walletId)}
        />
      </main>
      <RightPanel
        username={username}
        userId={userId ?? undefined}
        balance={balance}
        walletId={walletId ?? 0}
        updateBalance={updateBalance}
      />
    </div>
  );
}
