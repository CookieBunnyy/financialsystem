"use client";
import React, { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import axios from "axios";

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: "deposit" | "withdraw" | "expense";
  date: string;
}

export default function Dashboard() {
  const [showBalance, setShowBalance] = useState(true);
  const [showModal, setShowModal] = useState<"deposit" | "withdraw" | null>(
    null
  );
  const [modalAmount, setModalAmount] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balanceAmount, setBalanceAmount] = useState(0);

  const balance = useMotionValue(0);
  const formattedBalance = useTransform(balance, (latest) =>
    latest.toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    })
  );

  // ✅ Fetch balance and transactions from backend
  const fetchData = async () => {
    try {
      const [balRes, txRes] = await Promise.all([
        axios.get<number>("http://localhost:8080/api/balance"),
        axios.get<Transaction[]>(
          "http://localhost:8080/api/balance/transactions"
        ),
      ]);

      const balanceValue =
        typeof balRes.data === "number"
          ? balRes.data
          : (balRes.data as any).amount ?? 0;

      setBalanceAmount(balanceValue);
      animate(balance, balanceValue, { duration: 1.5 });
      setTransactions(txRes.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const openModal = (type: "deposit" | "withdraw") => {
    setModalAmount(0);
    setShowModal(type);
  };

  // ✅ Add deposit or withdraw transaction
  const handleTransaction = async (type: "deposit" | "withdraw") => {
    if (modalAmount <= 0) return alert("Enter a valid amount");

    if (type === "withdraw" && modalAmount > balanceAmount) {
      alert("Not enough balance!");
      return;
    }

    try {
      const res = await axios.post<Transaction>(
        "http://localhost:8080/api/balance/transaction",
        {
          description: type === "deposit" ? "Deposit" : "Withdraw",
          amount: modalAmount,
          type: type.toUpperCase(), // match backend enum (DEPOSIT/WITHDRAW)
        }
      );

      setTransactions((prev) => [...prev, res.data]);

      const balRes = await axios.get<number>(
        "http://localhost:8080/api/balance"
      );
      const newBalance =
        typeof balRes.data === "number"
          ? balRes.data
          : (balRes.data as any).amount ?? 0;

      setBalanceAmount(newBalance);
      animate(balance, newBalance, { duration: 1 });
      setShowModal(null);
    } catch (err) {
      console.error("Transaction failed:", err);
      alert("Transaction failed! Check backend or input.");
    }
  };

  return (
    <div className="text-gray-100 font-sans p-8">
      <h2 className="text-4xl font-extrabold text-[#d2c0d8] mb-10">
        DASHBOARD
      </h2>

      {/* 💰 My Balance */}
      <div className="flex justify-center mb-10">
        <div className="bg-[#1b1d3a] rounded-xl shadow-lg p-5 max-w-lg w-full text-left">
          <h3 className="text-lg text-gray-300 mb-2">My Balance</h3>

          <motion.div className="bg-[#24264a] rounded-lg px-6 py-3 shadow-inner w-full flex items-center justify-between relative">
            <motion.span
              className="text-[#d2c0d8] text-3xl font-semibold select-none"
              style={{
                fontFeatureSettings: '"tnum"',
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {showBalance ? formattedBalance : "******"}
            </motion.span>

            <button
              onClick={() => setShowBalance(!showBalance)}
              className="absolute right-4 text-gray-400 hover:text-[#d2c0d8] transition"
            >
              {showBalance ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
          </motion.div>

          <div className="flex gap-4 mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openModal("deposit")}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg font-semibold transition"
            >
              <ArrowDownCircle size={18} /> Deposit
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openModal("withdraw")}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg font-semibold transition"
            >
              <ArrowUpCircle size={18} /> Withdraw
            </motion.button>
          </div>
        </div>
      </div>

      {/* 📜 Transaction History */}
      <div className="bg-[#0a0b20] rounded-[2rem] shadow-2xl p-6 max-w-3xl mx-auto">
        <h3 className="text-[#d2c0d8] text-xl font-semibold mb-6">STATUS</h3>
        {transactions.length === 0 ? (
          <p className="text-gray-400 text-center">No transactions yet.</p>
        ) : (
          <ul className="max-h-64 overflow-y-auto text-left px-6">
            {transactions
              .slice()
              .reverse()
              .map((t) => (
                <li
                  key={t.id}
                  className={`flex justify-between mb-2 p-2 rounded-lg ${
                    t.type === "deposit"
                      ? "bg-green-900/40 text-green-300"
                      : "bg-red-900/40 text-red-300"
                  }`}
                >
                  <span>{t.description}</span>
                  <span>
                    ₱
                    {t.amount.toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  <span>{t.date}</span>
                </li>
              ))}
          </ul>
        )}
      </div>

      {/* 🧾 Modal */}
      <AnimatePresence mode="wait">
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#0a0b20] rounded-2xl p-8 shadow-2xl w-[400px] relative text-center border border-[#1b1d3a]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
            >
              <button
                onClick={() => setShowModal(null)}
                className="absolute top-3 right-3 text-gray-400 hover:text-[#f3d7e2] transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-2xl font-bold text-[#f3d7e2] mb-4">
                {showModal === "deposit" ? "Deposit" : "Withdraw"} Amount
              </h3>

              <input
                type="number"
                value={modalAmount}
                onChange={(e) => setModalAmount(Number(e.target.value))}
                placeholder="Enter amount"
                min={0}
                className="w-full mb-4 px-4 py-2 rounded-lg bg-[#1b1d3a] text-gray-300 placeholder-gray-500 focus:outline-none"
              />

              <button
                onClick={() => handleTransaction(showModal)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-semibold transition"
              >
                Confirm
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
