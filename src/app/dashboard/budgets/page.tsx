"use client";
//lagyan ko lang ng comments para di mahirap hanapin
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, PlusCircle } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";

interface Budget {
  id: number;
  amount: number;
  startDate: string;
  endDate: string;
}

interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
  budgetId: number;
}

export default function BudgetsPage() {
  const [budget, setBudget] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalBudget, setModalBudget] = useState(0);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [chartData, setChartData] = useState<{ name: string; value: number; isCurrent?: boolean }[]>([]);
  const [currentBudgetId, setCurrentBudgetId] = useState<number | null>(null);
  const [balance, setBalance] = useState(0);

  // para sa expenses
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  // sa remaining days nung budget money
  const [remainingDays, setRemainingDays] = useState(0);
  useEffect(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    const remaining = Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000*60*60*24)));
    setRemainingDays(remaining);
  }, [startDate, endDate]);

  // fetch budgets, balance, at expenses
  const fetchBudgets = async () => {
    try {
      const res = await axios.get<Budget[]>("http://localhost:8080/api/budgets");
      const budgets = res.data;
      if (!budgets || budgets.length === 0) return;

      const latestBudget = budgets[budgets.length - 1];
      setBudget(latestBudget.amount);
      setModalBudget(latestBudget.amount);
      setStartDate(latestBudget.startDate);
      setEndDate(latestBudget.endDate);
      setCurrentBudgetId(latestBudget.id);

      // month budget chart ito
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const dataMap: Record<string, number> = {};
      months.forEach(m => dataMap[m] = 0);

      budgets.forEach(b => {
        const month = new Date(b.startDate).toLocaleString("default", { month: "short" });
        dataMap[month] += b.amount;
      });

      const currentMonth = new Date().toLocaleString("default", { month: "short" });
      const chartArray = months.map(m => ({ name: m, value: dataMap[m], isCurrent: m===currentMonth }));
      setChartData(chartArray);

      // fetch balance
      const balRes = await axios.get("http://localhost:8080/api/balance");
      setBalance(balRes.data.amount);

      // fetch expenses
      const expRes = await axios.get<Expense[]>("http://localhost:8080/api/budget/expenses");
      setExpenses(expRes.data.filter(e => e.budgetId === latestBudget.id));
    } catch (err) {
      console.error("Error fetching budgets:", err);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  // para sa set budget balance function
  const handleSetBudget = async () => {
    if (modalBudget > balance) {
      alert("Not enough balance to set this budget!");
      return;
    }

    try {
      const newBudget = { amount: modalBudget, startDate, endDate };
      await axios.post("http://localhost:8080/api/budgets", newBudget);

      // deduct sa my balance sa dashboard or should i say wallet
      await axios.post("http://localhost:8080/api/balance/transaction", {
        amount: modalBudget,
        type: "withdraw",
        description: "Set Budget",
      });

      fetchBudgets();
      setShowModal(false);
    } catch (err) {
      console.error("Error saving budget:", err);
      alert("Failed to set budget.");
    }
  };

  // add expense
  const handleAddExpense = async () => {
    const amt = Number(expenseAmount);
    if (!expenseDesc || !expenseAmount || amt <= 0) return;
    if (amt > budget) {
      alert("Not enough budget for this expense!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8080/api/budget/expense", {
        budgetId: currentBudgetId,
        description: expenseDesc,
        amount: amt,
      });

      // deduct from current budget
      setBudget(prev => prev - amt);

      // update local expense list
      setExpenses(prev => [...prev, res.data]);

      // reset input
      setExpenseAmount("");
      setExpenseDesc("");
    } catch (err) {
      console.error("Error adding expense:", err);
      alert("Failed to add expense.");
    }
  };

  return (
    <main className="flex-1 px-10 py-8 bg-gradient-to-b from-[#0d0e26] to-[#1b1d3a] text-gray-100 min-h-screen">
      <h2 className="text-4xl font-extrabold text-[#d2c0d8] mb-10 tracking-wide">Budget Management</h2>

      <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }} className="bg-[#151536] p-6 rounded-2xl shadow-xl max-w-110 mx-auto mb-12 flex flex-col md:flex-row justify-between items-center gap-6 border border-[#2b2d55]">
        <div className="flex flex-col w-full md:w-auto text-center md:text-left">
          <span className="text-gray-300 font-semibold mb-2">CURRENT BUDGET</span>
          <div className="flex items-center justify-center md:justify-start bg-gray-200 text-gray-900 rounded-lg px-4 py-2 text-xl font-semibold">
            <span className="text-[#1b1d3a] mr-2">₱</span>
            <span className="w-40 text-left">{budget.toLocaleString("en-PH", { minimumFractionDigits:2 })}</span>
          </div>
          <p className="text-gray-400 mt-2">Remaining Days: <span className="font-semibold">{remainingDays}</span></p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-[#24264a] text-white font-semibold text-m rounded-full px-7 py-2 shadow-md hover:bg-[#2f3160] transition-all">
          SET BUDGET
        </button>
      </motion.div>

      <div className="bg-[#0a0b20] rounded-[2rem] shadow-2xl p-8 max-w-4xl mx-auto">
        <h3 className="text-[#d2c0d8] text-xl font-semibold mb-6">Budget Overview</h3>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={40}>
              <XAxis dataKey="name" stroke="#ccc"/>
              <YAxis stroke="#ccc"/>
              <Tooltip contentStyle={{ backgroundColor:"#1b1d3a", borderRadius:"10px", border:"none", color:"#fff"}}/>
              <Bar dataKey="value" fill="#f97316">
                {chartData.map((entry,index)=>(
                  <Cell key={`cell-${index}`} fill={entry.isCurrent ? "#34d399" : "#f97316"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.8, opacity:0}} className="bg-[#151536] p-8 rounded-2xl shadow-xl w-96 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-1 rounded-full hover:bg-[#2b2d55] transition">
              <X className="w-5 h-5"/>
            </button>

            <h3 className="text-xl font-semibold text-[#d2c0d8] mb-6">Set Budget</h3>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-gray-300 mb-1 block">Amount</label>
                <input type="number" value={modalBudget} onChange={e => setModalBudget(Number(e.target.value))} className="w-full p-2 rounded-lg bg-[#0a0b20] border border-gray-600 text-white"/>
              </div>
              <div>
                <label className="text-gray-300 mb-1 block">Start Date</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 rounded-lg bg-[#0a0b20] border border-gray-600 text-white"/>
              </div>
              <div>
                <label className="text-gray-300 mb-1 block">End Date</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 rounded-lg bg-[#0a0b20] border border-gray-600 text-white"/>
              </div>

              <button onClick={handleSetBudget} className="mt-4 bg-[#f97316] text-white font-semibold py-2 rounded-lg hover:bg-[#ff8000] transition">Save Budget</button>

              {currentBudgetId && (
                <div className="mt-6">
                  <h4 className="text-[#d2c0d8] font-semibold mb-2">Add Expense</h4>
                  <input type="text" placeholder="Description" value={expenseDesc} onChange={e=>setExpenseDesc(e.target.value)} className="w-full mb-2 p-2 rounded-lg bg-[#0a0b20] border border-gray-600 text-white"/>
                  <input type="number" placeholder="Amount" value={expenseAmount} onChange={e=>setExpenseAmount(e.target.value)} className="w-full mb-2 p-2 rounded-lg bg-[#0a0b20] border border-gray-600 text-white"/>
                  <button onClick={handleAddExpense} className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-2 rounded-lg"><PlusCircle/> Add Expense</button>

                  {/* display expenses */}
                  {expenses.length > 0 && (
                    <ul className="mt-4 max-h-40 overflow-y-auto text-gray-300 text-left">
                      {expenses.map(e => (
                        <li key={e.id} className="flex justify-between border-b border-gray-700 py-1">
                          <span>{e.description}</span>
                          <span>₱{e.amount.toLocaleString("en-PH", {minimumFractionDigits:2})}</span>
                          <span className="text-gray-400 text-sm">{e.date}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
