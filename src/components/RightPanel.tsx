"use client";

import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Copy, Zap, Truck, ShoppingCart } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import API from "@/lib/api";
import { Button } from "@/components/ui/button";

interface Expense {
  expensesId: string;
  walletId: number;
  amount: number;
  whereSpent: string;
  date: string;
}

interface RightPanelProps {
  username: string;
  userId?: number;
  walletId: number;
  balance: number;
  updateBalance?: (amt: number) => void;
}

export default function RightPanel({
  username,
  userId,
  walletId,
  balance,
  updateBalance,
}: RightPanelProps) {
  const [currentBalance, setCurrentBalance] = useState(balance);
  const [showBalance, setShowBalance] = useState(true);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categoryIcons: Record<string, React.ReactNode> = {
    "Electric Bill": <Zap size={20} className="text-yellow-500" />,
    Transportation: <Truck size={20} className="text-blue-500" />,
    Grocery: <ShoppingCart size={20} className="text-green-500" />,
  };

  
  const fetchWallet = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await API.get(`/wallets/user/${userId}`);
      if (res?.data?.balance != null) {
        setCurrentBalance(res.data.balance);
        updateBalance?.(res.data.balance - currentBalance); 
      }
    } catch (err: any) {
      console.error("[RightPanel] fetchWallet error:", err);
      setError("Failed to fetch wallet");
    } finally {
      setLoading(false);
    }
  };

 
  const fetchExpenses = async () => {
    if (!walletId) return;
    try {
      const res = await API.get("/expenses");
      const data: Expense[] = Array.isArray(res.data) ? res.data : [];
      const filtered = data
        .filter((e) => e.walletId === walletId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      setRecentExpenses(filtered);
    } catch (err: any) {
      console.error("[RightPanel] fetchExpenses error:", err);
      setRecentExpenses([]);
    }
  };

  useEffect(() => {
    fetchWallet();
    fetchExpenses();
  }, [userId, walletId]);

  const copyWalletId = () => {
    navigator.clipboard.writeText(String(walletId));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const refreshBalance = () => {
    fetchWallet();
  };

  return (
    <aside className="w-96 bg-gray-200 p-6 border-l min-h-[500px]">
      {/* User greeting */}
      <div className="mb-4 text-lg font-semibold text-gray-700">
        Hello, {username}
      </div>

      {/* Balance Card */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm text-gray-500">Available Balance</div>
            <div className="text-3xl text-violet-700 font-extrabold mt-1">
              {showBalance
                ? `₱ ${currentBalance.toFixed(2)}`
                : "*****"}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Wallet ID: {walletId}
            </div>
          </div>

          {/* QR code */}
          <div className="ml-4 bg-violet-500 flex-shrink-0">
            <QRCodeSVG
              value={`finova://wallet?walletId=${walletId}&user=${userId ?? ""}&balance=${currentBalance}`}
              size={100}
              bgColor="#ffffffff"
              fgColor="#6626cdff"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2 items-center">
          <Button
            onClick={copyWalletId}
            className="bg-violet-700 hover:bg-violet-600 text-white"
          >
            Copy Wallet ID
            {copied && (
              <span className="ml-2 text-green-600 text-xs">Copied!</span>
            )}
          </Button>
          <Button variant="outline" onClick={refreshBalance}>
            Refresh
          </Button>
          <Button
            variant="ghost"
            className="text-violet-700 hover:text-violet-800"
            onClick={() => setShowBalance(!showBalance)}
          >
            {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="text-lg text-violet-700 font-semibold mb-3">
          Recent Expenses
        </h3>
        {recentExpenses.length === 0 ? (
          <div className="text-sm text-gray-500">No recent expenses</div>
        ) : (
          recentExpenses.map((e) => (
            <div
              key={e.expensesId}
              className="flex justify-between items-center text-sm py-1 border-b last:border-b-0"
            >
              <div className="flex items-center gap-2">
                {categoryIcons[e.whereSpent] || (
                  <ShoppingCart size={16} className="text-gray-600" />
                )}
                <span>{e.whereSpent}</span>
              </div>
              <span className="font-medium">₱ {e.amount.toFixed(2)}</span>
            </div>
          ))
        )}
        {error && (
          <div className="text-red-500 text-sm mt-3">{error}</div>
        )}
      </div>
    </aside>
  );
}
