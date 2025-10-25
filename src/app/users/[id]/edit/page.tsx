"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditUserPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const { id } = params;

//para naman to sa user page na hindi pa tapos HAHAHAHA
  
  useEffect(() => {
  if (!id || id === "[id]") return; // prevent calling api with invalid id
  async function loadUser() {
    try {
      const res = await fetch(`http://localhost:8080/api/users/${id}`);
      if (!res.ok) throw new Error("Failed to fetch user data.");
      const data = await res.json();
      setFormData({
        name: data.name || "",
        email: data.email || "",
        password: "",
      });
    } catch (error) {
      setMessage("❌ Error loading user data.");
    } finally {
      setLoading(false);
    }
  }
  loadUser();
}, [id]);

  // handle in input change
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // handle sa form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:8080/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage("✅ User updated successfully!");
        setTimeout(() => router.push("/users"), 1200);
      } else {
        setMessage("❌ Failed to update user.");
      }
    } catch (error) {
      setMessage("❌ Error connecting to the server.");
    }
  };

  // show loading indicator
  if (loading) {
    return <p className="text-center p-8 text-gray-600">Loading user data...</p>;
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit User</h1>

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
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            New Password (optional)
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={() => router.push("/users")}
            className="border px-4 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            ← Back
          </button>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        </div>
      </form>

      {message && (
        <p
          className={`mt-4 text-center font-medium ${
            message.includes("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
