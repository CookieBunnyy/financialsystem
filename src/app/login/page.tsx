"use client";
import { useState } from "react";
import API from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      console.log("[login] POST /auth/login with email:", email);
      const res = await API.post("/auth/login", { email: email.trim(), password });

      
      console.log("[login] response:", res.status, res.data);
      const { token, userId, username } = res.data;

      if (!token || !userId) {
        throw new Error("Login response missing token or userId");
      }

      
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId.toString());
      localStorage.setItem("username", username || "User");

     
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      console.log("[login] stored token and userId, redirecting to /");
      setMessage({ type: "success", text: "Login successful!" });
      
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (error: any) {
      console.error("[login] error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      
      
      if (error.response?.status === 401) {
        setMessage({ type: "error", text: "Invalid email or password" });
      } else {
        setMessage({ type: "error", text: error.response?.data?.error || error.message || "Login failed" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

        {message && (
          <div className={`p-3 mb-4 text-center rounded ${
            message.type === "error" 
              ? "bg-red-100 text-red-800" 
              : "bg-green-100 text-green-800"
          }`}>
            {message.text}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <input
            className="border p-2 w-full rounded-md focus:outline-none focus:border-violet-600"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <input
            className="border p-2 w-full rounded-md focus:outline-none focus:border-violet-600"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <button
            className={`bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-md w-full transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          No account?{" "}
          <span
            onClick={() => router.push("/register")}
            className="text-violet-600 cursor-pointer hover:underline"
          >
            Register here
          </span>
        </p>
      </div>
    </div>
  );
}
