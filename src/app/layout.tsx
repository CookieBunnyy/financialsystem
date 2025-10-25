
//ito yung main page sana pero in development pa kasa neto ang page.tsx 

// src/app/layout.tsx
import "./index.css";
import React from "react";

export const metadata = {
  title: "Dashboard",
  description: "Admin dashboard interface",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">{children}</body>
    </html>
  );
}
