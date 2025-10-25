"use client";

import React from "react";
import { MessageSquare, PieChart, Inbox, Settings, User, Home } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Dashboard", icon: Home, path: "/dashboard" }, 
    { name: "Transaction", icon: MessageSquare, path: "/dashboard/transactions" },
    { name: "Budget", icon: PieChart, path: "/dashboard/budgets" },
    { name: "Inbox", icon: Inbox, path: "/dashboard/inbox" },
    { name: "Settings", icon: Settings, path: "/dashboard/settings" },
  ];

  return (
    <div className="flex bg-gradient-to-b from-[#0d0e26] to-[#1b1d3a] text-gray-100 font-sans min-h-screen">
      {/* sidebar hehe */}
      <aside
        className="
          fixed top-0 left-0 
          h-screen w-64 
          bg-[#0a0b20] 
          flex flex-col justify-between 
          py-8 px-4 shadow-2xl rounded
        "
      >
        <div>
          {/* sample logo lang */}
          <div className="flex items-center space-x-2 mb-10 pl-4">
            <div className="bg-yellow-500 rounded-full w-6 h-6"></div>
            <h1 className="text-2xl font-extrabold tracking-wide text-white">
              FINOVA
            </h1>
          </div>

          {/* Navs hehe */}
          <nav className="flex flex-col space-y-6 w-full">
            {navItems.map(({ name, icon: Icon, path }) => (
              <button
                key={name}
                onClick={() => router.push(path)}
                className={`flex items-center space-x-3 text-lg transition px-4 w-full text-left ${
                  pathname === path
                    ? "text-purple-400"
                    : "hover:text-purple-300 text-gray-300"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* non function pa na user profile hehe */}
        <div className="bg-[#1b1d3a] flex items-center justify-between w-full px-4 py-3 rounded-xl shadow-md mt-8">
          <h4 className="text-white text-sm font-bold tracking-wide">
            DAVID CORTEZ
          </h4>
          <div className="bg-[#2a2c4a] p-2 rounded-full">
            <User size={20} className="text-gray-300" />
          </div>
        </div>
      </aside>

      {/* content body area */}
      <main
        className="
          flex-1 ml-64 px-10 py-8 
          overflow-y-auto 
          min-h-screen
        "
      >
        {children}
      </main>
    </div>
  );
}
