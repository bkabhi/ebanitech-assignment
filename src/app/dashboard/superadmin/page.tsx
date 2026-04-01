"use client";

import { useState, useEffect } from "react";

export default function SuperAdminDashboard() {
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [adminForm, setAdminForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [userForm, setUserForm] = useState({ name: "", email: "", phone: "", password: "", adminId: "" });
  const [activeTab, setActiveTab] = useState("admins");

  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [adminsRes, usersRes] = await Promise.all([
        fetch("/api/admins"),
        fetch("/api/superadmin/users")
      ]);
      const adminsData = await adminsRes.json();
      const usersData = await usersRes.json();
      setAdmins(adminsData.admins || []);
      setUsers(usersData.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminForm),
      });
      if (res.ok) {
        setAdminForm({ name: "", email: "", phone: "", password: "" });
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/superadmin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });
      if (res.ok) {
        setUserForm({ name: "", email: "", phone: "", password: "", adminId: "" });
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (confirm("Are you sure you want to delete this admin and all their users?")) {
      await fetch(`/api/admins/${id}`, { method: "DELETE" });
      fetchData();
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Are you sure?")) {
      await fetch(`/api/superadmin/users/${id}`, { method: "DELETE" });
      fetchData();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b pb-2">
        <button 
          className={`font-medium ${activeTab === 'admins' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('admins')}
        >
          Manage Admins
        </button>
        <button 
          className={`font-medium ${activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('users')}
        >
          Manage Users
        </button>
      </div>

      {error && <div className="text-red-500">{error}</div>}

      {activeTab === 'admins' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 text-black">Create Admin</h3>
            <form onSubmit={handleCreateAdmin} className="space-y-3">
              <input required type="text" placeholder="Name" className="w-full border p-2 rounded text-black" value={adminForm.name} onChange={e => setAdminForm({...adminForm, name: e.target.value})} />
              <input required type="email" placeholder="Email" className="w-full border p-2 rounded text-black" value={adminForm.email} onChange={e => setAdminForm({...adminForm, email: e.target.value})} />
              <input type="text" placeholder="Phone" className="w-full border p-2 rounded text-black" value={adminForm.phone} onChange={e => setAdminForm({...adminForm, phone: e.target.value})} />
              <input required type="password" placeholder="Password" className="w-full border p-2 rounded text-black" value={adminForm.password} onChange={e => setAdminForm({...adminForm, password: e.target.value})} />
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Create</button>
            </form>
          </div>
          <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-sm border overflow-x-auto">
            <h3 className="text-lg font-semibold mb-4 text-black">Admins List</h3>
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
                {admins.map((admin: any) => (
                  <tr key={admin._id} className="border-b text-black">
                    <td className="p-2">{admin.name}</td>
                    <td className="p-2">{admin.email}</td>
                    <td className="p-2">{admin.phone}</td>
                    <td className="p-2">
                      <button onClick={() => handleDeleteAdmin(admin._id)} className="text-red-500 hover:text-red-700">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 text-black">Create User</h3>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <select required className="w-full border p-2 rounded text-black" value={userForm.adminId} onChange={e => setUserForm({...userForm, adminId: e.target.value})}>
                <option value="">Select Admin</option>
                {admins.map((a: any) => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
              <input required type="text" placeholder="Name" className="w-full border p-2 rounded text-black" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} />
              <input required type="email" placeholder="Email" className="w-full border p-2 rounded text-black" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} />
              <input type="text" placeholder="Phone" className="w-full border p-2 rounded text-black" value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})} />
              <input required type="password" placeholder="Password" className="w-full border p-2 rounded text-black" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} />
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Create</button>
            </form>
          </div>
          <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-sm border overflow-x-auto">
            <h3 className="text-lg font-semibold mb-4 text-black">Users List</h3>
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b text-black">
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Admin</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user._id} className="border-b text-black">
                    <td className="p-2">{user.name}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.createdBy?.name || 'Unknown'}</td>
                    <td className="p-2">
                      <button onClick={() => handleDeleteUser(user._id)} className="text-red-500 hover:text-red-700">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
