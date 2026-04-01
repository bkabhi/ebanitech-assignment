"use client";

import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [userForm, setUserForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });
      if (res.ok) {
        setUserForm({ name: "", email: "", phone: "", password: "" });
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Are you sure?")) {
      await fetch(`/api/users/${id}`, { method: "DELETE" });
      fetchUsers();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
      <p className="text-gray-600 mb-6">Manage users created by you</p>

      {error && <div className="text-red-500">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 text-black">Create User</h3>
          <form onSubmit={handleCreateUser} className="space-y-3">
            <input required type="text" placeholder="Name" className="w-full border p-2 rounded text-black" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} />
            <input required type="email" placeholder="Email" className="w-full border p-2 rounded text-black" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} />
            <input type="text" placeholder="Phone" className="w-full border p-2 rounded text-black" value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})} />
            <input required type="password" placeholder="Password" className="w-full border p-2 rounded text-black" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} />
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Create User</button>
          </form>
        </div>
        <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-sm border overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4 text-black">Your Users</h3>
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b text-black">
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr key={user._id} className="border-b text-black">
                  <td className="p-2">{user.name}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">{user.phone}</td>
                  <td className="p-2">
                    <button onClick={() => handleDeleteUser(user._id)} className="text-red-500 hover:text-red-700">Delete</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={4} className="p-4 text-center text-gray-500">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
