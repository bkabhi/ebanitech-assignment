"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        </div>
        <nav className="mt-6 flex flex-col h-[calc(100vh-100px)] justify-between">
          <ul className="space-y-2 px-4">
            <li>
              <div className="block py-2 px-4 rounded hover:bg-gray-100 text-gray-700 font-medium cursor-pointer">
                Home
              </div>
            </li>
          </ul>
          <div className="px-4 pb-6">
            <button
              onClick={handleLogout}
              className="w-full text-left py-2 px-4 rounded text-red-600 hover:bg-red-50 font-medium"
            >
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-8 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Overview</h2>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
