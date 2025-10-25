
//ito naman yung table or list ng user na meron tayo sa database
import React from "react";
import Link from "next/link";
import { fetchUsers } from "@/lib/api";

export default async function UsersPage() {
  const users = await fetchUsers();

  async function deleteUser(id) {
    "use server";
    await fetch(`http://localhost:8080/api/users/${id}`, {
      method: "DELETE",
    });
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User List</h1>
        <Link
          href="/users/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add User
        </Link>
      </div>

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3 border-b">Name</th>
              <th className="text-left p-3 border-b">Email</th>
              <th className="p-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="p-3 border-b">{user.name}</td>
                <td className="p-3 border-b">{user.email}</td>
                <td className="p-3 border-b text-center">
                  <div className="flex gap-2 justify-center">
                    <Link
                      href={`/users/${user.id}/edit`}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>

                    <form action={deleteUser.bind(null, user.id)}>
                      <button
                        type="submit"
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
