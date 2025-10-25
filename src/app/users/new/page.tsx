
//ito naman para sa backend function ng New User para maka add tayo ng user sa database
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewUserPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const router = useRouter();

  // handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage("✅ User added successfully!");
        setFormData({ name: "", email: "", password: "" });

        // redirect to user list after 1 second
        setTimeout(() => {
          router.push("/users");
        }, 1000);
      } else {
        setMessage("❌ Failed to add user.");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      setMessage("❌ Something went wrong.");
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add New User</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 border p-6 rounded-xl shadow-md bg-white"
      >
        <div>
          <label className="block text-sm font-semibold mb-1">Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Email</label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={() => router.push("/users")}
            className="border px-4 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            ← Back to User List
          </button>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Add User
          </button>
        </div>
      </form>

      {message && <p className="mt-4 text-center font-medium">{message}</p>}
    </div>
  );
}
