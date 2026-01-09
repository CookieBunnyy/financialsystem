"use client";

import React, { useState } from "react";
import API from "../lib/api";

interface NewTransactionFormProps {
  walletId: number; 
  updateBalance?: (amt: number) => void | Promise<void>;
  onCreated?: () => void;
}

export default function NewTransactionForm({ walletId, updateBalance, onCreated }: NewTransactionFormProps) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Budgets");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert("Enter a valid amount");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        walletId,
        amount: numAmount,
        category,
        description: description || category,
      };

      console.log("[NewTransactionForm] POST /expenses", payload);

      await API.post("/expenses", payload);

  
      updateBalance?.(-numAmount);

      setAmount("");
      setDescription("");
      setCategory("Budgets");

      onCreated?.();
    } catch (err: any) {
      console.error("[NewTransactionForm] Transaction creation failed:", err);
      alert(err.response?.data?.error || err.message || "Failed to create transaction");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex gap-2 items-center">
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        className="p-2 rounded border"
        type="number"
        required
        disabled={loading}
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="p-2 rounded border"
        disabled={loading}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="p-2 rounded border"
        disabled={loading}
      >
        <option>Budgets</option>
        <option>Savings</option>
        <option>Withdraw</option>
      </select>
      <button
        type="submit"
        className={`bg-violet-600 text-white px-4 py-2 rounded ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={loading}
      >
        {loading ? "Adding..." : "Add"}
      </button>
    </form>
  );
}
