"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BudgetPage() {
  const [addModal, setAddModal] = useState(false);

  const budgets = [
    { category: "Food", totalAmount: 5000 },
    { category: "Rent", totalAmount: 8000 },
  ]; // replace later with DB data

  return (
    <div className="px-50 py-10 w-232 h-50 bg-gray-100 flex flex-col items-center">
      {/* HEADER */}
      <h1 className="text-3xl font-bold text-violet-700 mb-6">Budgets</h1>

      {/* BUDGET CARDS */}
      <div className="flex flex-col gap-4 w-[380px]">
        {budgets.map((b, i) => (
          <div key={i} className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
            <div className="text-gray-500 text-sm">Category</div>
            <div className="text-xl font-bold text-violet-700">{b.category}</div>
            <div className="text-gray-500 mt-1">Budget: ₱{b.totalAmount.toLocaleString()}</div>
          </div>
        ))}

        {/* ADD BUDGET BUTTON */}
        <Button className="flex items-center gap-2 mt-4" onClick={() => setAddModal(true)}>
          <Plus className="w-5 h-5" />
          Add Budget
        </Button>
      </div>

      {/* ADD BUDGET MODAL */}
      <Dialog open={addModal} onOpenChange={setAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Budget</DialogTitle>
            <DialogDescription>
              Enter the details of your budget.
            </DialogDescription>
          </DialogHeader>

          <Input type="text" placeholder="Category" className="mt-4" />
          <Input type="number" placeholder="Total Amount (₱)" className="mt-4" />
          <Input type="date" placeholder="Start Date" className="mt-4" />
          <Input type="date" placeholder="End Date" className="mt-4" />

          <Button className="w-full mt-4">Submit</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
