import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Finova',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex">
          {children}
        </div>
      </body>
    </html>
  );
}


