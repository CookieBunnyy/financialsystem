"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Database, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Update {
  id: number;
  title: string;
  message: string;
  type: "announcement" | "update" | "warning" | "success";
  time: string;
}

export default function InboxPage() {
  const [updates, setUpdates] = useState<Update[]>([]);

  // ahmmm... fetching updates sa database???
  useEffect(() => {
    const mockUpdates: Update[] = [
      {
        id: 1,
        title: "New Budgeting Feature Released",
        message: "You can now create multiple budgets with automatic tracking.",
        type: "announcement",
        time: "2 hours ago",
      },
      {
        id: 2,
        title: "Database Sync Successful",
        message: "All user transaction records are now synced to the cloud.",
        type: "success",
        time: "5 hours ago",
      },
      {
        id: 3,
        title: "System Maintenance Notice",
        message:
          "Scheduled maintenance will occur on Oct 30 from 12AM to 3AM (UTC+8).",
        type: "warning",
        time: "1 day ago",
      },
      {
        id: 4,
        title: "Transaction API Updated",
        message: "Improved response speed and added new endpoints.",
        type: "update",
        time: "3 days ago",
      },
    ];
    setTimeout(() => setUpdates(mockUpdates), 800);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "announcement":
        return <Bell className="text-blue-400" size={24} />;
      case "update":
        return <Database className="text-purple-400" size={24} />;
      case "warning":
        return <AlertTriangle className="text-yellow-400" size={24} />;
      case "success":
        return <CheckCircle2 className="text-green-400" size={24} />;
      default:
        return <Bell className="text-gray-400" size={24} />;
    }
  };

  return (
    <div className="text-gray-100">
      <h2 className="text-4xl font-extrabold text-[#d2c0d8] mb-8 tracking-wide">
        Inbox & Updates
      </h2>

      {updates.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-400 text-center mt-20"
        >
          Loading updates...
        </motion.div>
      ) : (
        <motion.div
          layout
          className="flex flex-col space-y-6 bg-[#0a0b20]/60 p-8 rounded-2xl shadow-2xl"
        >
          {updates.map((update) => (
            <motion.div
              key={update.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-4 p-4 rounded-xl bg-[#1b1d3a]/70 hover:bg-[#24264a] transition-all shadow-md"
            >
              <div className="flex-shrink-0 mt-1">{getIcon(update.type)}</div>
              <div>
                <h3 className="font-semibold text-lg text-[#f3d7e2]">
                  {update.title}
                </h3>
                <p className="text-gray-400 text-sm">{update.message}</p>
                <p className="text-xs text-gray-500 mt-2">{update.time}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
