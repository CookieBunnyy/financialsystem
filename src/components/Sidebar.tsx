"use client";

import React, { useState } from "react";
import "@/app/globals.css";
import { Home, Inbox, Headphones, Settings, LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

interface SidebarProps {
  setCurrentPage: React.Dispatch<React.SetStateAction<"dashboard" | "savings">>;
}

export default function Sidebar({ setCurrentPage }: SidebarProps) {
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");

   
    router.push("/login");
  };

  return (
    <aside className="w-42 bg-violet-600 text-white flex flex-col py-6 px-4">
      {/* Logo */}
      <div
        className="text-xl font-bold cursor-pointer mb-6"
        onClick={() => setCurrentPage("dashboard")}
      >
        FINOVA
      </div>

      {/* Top Navigation */}
      <div className="flex flex-col space-y-4">
        <div
          className="flex items-center space-x-3 cursor-pointer hover:opacity-90"
          onClick={() => setCurrentPage("dashboard")}
        >
          <Home className="w-5 h-5" />
          <span className="text-sm">Home</span>
        </div>

        <div className="flex items-center space-x-3 cursor-pointer hover:opacity-90">
          <Inbox className="w-5 h-5" />
          <span className="text-sm">Inbox</span>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-auto space-y-6">
        <div className="flex items-center space-x-3 cursor-pointer hover:opacity-90">
          <Headphones className="w-5 h-5" />
          <span className="text-sm">Support</span>
        </div>

        {/* Settings Dropdown */}
        <div className="flex flex-col space-y-1">
          <div
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="flex justify-between items-center cursor-pointer hover:opacity-90"
          >
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5" />
              <span className="text-sm">Settings</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transform transition-transform duration-200 ${
                settingsOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {/* Dropdown Content */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              settingsOpen ? "max-h-20" : "max-h-0"
            }`}
          >
            <div
              onClick={handleLogout}
              className="flex items-center space-x-3 pl-6 py-1 cursor-pointer hover:opacity-90"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
