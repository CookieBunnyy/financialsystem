"use client";
import { useState } from "react";
import API from "@/lib/api";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Trim input to avoid accidental spaces
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      };

      console.log("[register] POST /auth/register", payload);
      const res = await API.post("/auth/register", payload);

      console.log("[register] response:", res.status, res.data);

      const { userId, message: msg } = res.data;

      if (!userId) {
        throw new Error("Registration did not return a valid userId");
      }

      setMessage({ type: "success", text: msg || "User registered successfully!" });

      
      localStorage.setItem("userId", userId.toString());
      localStorage.setItem("username", res.data.username || "User");

      
      setTimeout(() => router.push("/login"), 1500);
    } catch (error: any) {
      console.error("[register] error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      const errMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Registration failed.";
      setMessage({ type: "error", text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>

        {message && (
          <div
            className={`p-2 mb-4 text-center rounded ${
              message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            className="border p-2 w-full rounded-md focus:outline-none focus:border-violet-600"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
          <input
            className="border p-2 w-full rounded-md focus:outline-none focus:border-violet-600"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="border p-2 w-full rounded-md focus:outline-none focus:border-violet-600"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button
            className={`bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-md w-full transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            type="submit"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-violet-600 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
