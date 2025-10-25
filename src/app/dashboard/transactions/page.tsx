"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  PiggyBank,
  PlusCircle,
  ArrowDownCircle,
  X,
  Wallet,
  Send,
} from "lucide-react";
import axios from "axios";

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: "DEPOSIT" | "WITHDRAW";
  date: string;
}

export default function TransactionPage() {
  const [selected, setSelected] = useState("Savings");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);

  // Modal controls
  const [showModal, setShowModal] = useState<"deposit" | "expense" | null>(null);
  const [modalAmount, setModalAmount] = useState(0);
  const [modalDescription, setModalDescription] = useState("");

  // Fetch transactions and balance
  const fetchData = async () => {
    try {
      const [balanceRes, transRes] = await Promise.all([
        axios.get("http://localhost:8080/api/balance"),
        axios.get("http://localhost:8080/api/balance/transactions"),
      ]);

      const balanceValue =
        typeof balanceRes.data === "number"
          ? balanceRes.data
          : (balanceRes.data as any).amount ?? 0;

      setBalance(balanceValue);
      setTransactions(transRes.data);
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add Deposit (Savings) or Expense
  const handleAddTransaction = async (type: "deposit" | "expense") => {
    if (modalAmount <= 0) return alert("Enter a valid amount.");

    // Match backend enum values (uppercase)
    const transactionType = type === "deposit" ? "DEPOSIT" : "WITHDRAW";

    try {
      const res = await axios.post(
        "http://localhost:8080/api/balance/transaction",
        {
          description:
            modalDescription ||
            (type === "deposit" ? "Added Savings" : "Expense"),
          amount: modalAmount,
          type: transactionType,
        }
      );

      // Update UI immediately after saving
      setTransactions((prev) => [...prev, res.data]);
      setModalAmount(0);
      setModalDescription("");
      setShowModal(null);

      // Refresh to sync My Balance
      fetchData();
    } catch (err) {
      console.error("Transaction failed:", err);
      alert("Failed to save transaction! Check amount or server connection.");
    }
  };

  return (
    <div className="text-gray-100 font-sans p-8">
      <h2 className="text-4xl font-extrabold text-[#d2c0d8] mb-10">
        TRANSACTIONS
      </h2>

      {/* Balance Card */}
      <div className="bg-[#1b1d3a] rounded-xl shadow-lg p-6 max-w-lg mx-auto mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg text-gray-300">My Balance</h3>
            <p
              className={`text-2xl font-bold mt-1 ${
                balance <= 0 ? "text-red-500" : "text-green-400"
              }`}
            >
              ₱
              {typeof balance === "number"
                ? balance.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })
                : "0.00"}{" "}
              {balance <= 0 && "(No remaining balance)"}
            </p>
          </div>
          <Wallet size={36} className="text-[#d2c0d8]" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-6 mb-6">
        {["Savings", "Expenses"].map((tab) => (
          <motion.button
            key={tab}
            onClick={() => setSelected(tab)}
            className={`px-6 py-2 rounded-xl font-semibold ${
              selected === tab
                ? "bg-[#d2c0d8] text-[#0a0b20]"
                : "bg-[#1b1d3a] text-gray-400 hover:text-[#d2c0d8]"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab}
          </motion.button>
        ))}
      </div>

      {/* Savings / Expenses Card */}
      <AnimatePresence mode="wait">
        {selected === "Savings" ? (
          <motion.div
            key="savings"
            className="bg-[#0a0b20] rounded-[2rem] p-6 max-w-xl mx-auto shadow-2xl"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#d2c0d8]">
                Total Savings
              </h3>
              <PiggyBank className="text-green-400" size={32} />
            </div>

            <button
              onClick={() => setShowModal("deposit")}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg font-semibold transition"
            >
              <PlusCircle size={18} /> Add Savings
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="expenses"
            className="bg-[#0a0b20] rounded-[2rem] p-6 max-w-xl mx-auto shadow-2xl"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#d2c0d8]">
                Total Expenses
              </h3>
              <Send className="text-red-400" size={32} />
            </div>

            <button
              onClick={() => setShowModal("expense")}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg font-semibold transition"
            >
              <ArrowDownCircle size={18} /> Add Expense
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal for Adding Savings or Expense */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#0a0b20] rounded-2xl p-8 shadow-2xl w-[400px] relative border border-[#1b1d3a]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
            >
              <button
                onClick={() => setShowModal(null)}
                className="absolute top-3 right-3 text-gray-400 hover:text-[#f3d7e2]"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-2xl font-bold text-[#f3d7e2] mb-4">
                {showModal === "deposit" ? "Add Savings" : "Add Expense"}
              </h3>

              <input
                type="text"
                value={modalDescription}
                onChange={(e) => setModalDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full mb-3 px-4 py-2 rounded-lg bg-[#1b1d3a] text-gray-300 placeholder-gray-500 focus:outline-none"
              />

              <input
                type="number"
                value={modalAmount}
                onChange={(e) => setModalAmount(Number(e.target.value))}
                placeholder="Enter amount"
                min={0}
                className="w-full mb-4 px-4 py-2 rounded-lg bg-[#1b1d3a] text-gray-300 placeholder-gray-500 focus:outline-none"
              />

              <button
                onClick={() => handleAddTransaction(showModal)}
                className={`w-full py-2 rounded-lg font-semibold transition ${
                  showModal === "deposit"
                    ? "bg-green-600 hover:bg-green-500"
                    : "bg-red-600 hover:bg-red-500"
                }`}
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
