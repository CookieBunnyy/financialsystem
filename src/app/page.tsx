//in development pa to, no design basta dadalhin ka lang neto sa dashboard ng finance system. 
//maglalagay pa ng design sa future HAHAHAHAHAH

// src/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to the Dashboard</h1>
        <Link
          href="/dashboard"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}
