"use client"

import {
  Search,
  Mail,
  Phone,
  Calendar,
  Trash2,
  MapPin,
  CheckCircle2,
  Clock
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState, useEffect } from "react";

export default function UsersList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const response = await fetch("/dashboard/api", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authorized token")}`
          }
        });
        if (!response.ok) throw new Error("Failed to fetch");

        const result = await response.json();
        
        setData(result?.data?.items || []);
        setLoading(false)
      } catch (err) {
        console.error("Fetch error:", err);
        setLoading(false)
      }
    };

    fetchUsersData();
  }, []);

 
  const filteredUsers = data.filter((user:any) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return (
      fullName.includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (loading) {
    return <div className="p-10 text-center text-slate-500">Loading Users...</div>;
  }

  return (
    <div className="w-full rounded-2xl border bg-white dark:bg-[#111318] border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
      
      <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Users List</h2>
        <div className="flex items-center w-full sm:w-80 rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 overflow-hidden focus-within:ring-2 focus-within:ring-amber-500/50 transition-all">
          <div className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-800 flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/30">
            <Search className="text-slate-400 dark:text-slate-500" size={18} />
          </div>

          <Input
            type="text"
            placeholder="Search name, email or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent px-4 py-2 text-sm outline-none text-slate-900 focus-visible:ring-0 focus-visible:border-0 dark:text-slate-200 placeholder:text-slate-500 border-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-400 dark:text-slate-500 text-sm font-medium border-b border-slate-100 dark:border-slate-800">
              <th className="px-6 py-4">User Info</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">SignUp Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user:any) => (
                <tr key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full flex items-center justify-center border border-amber-500/20 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        {!user.avatarUrl ? (
                          <Image src={user.avatarUrl || "/avatar-default.png"} alt="avatar" width={40} height={40} className="object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-amber-600">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        )}
                        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white dark:border-[#111318] rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-400'}`} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-slate-200 capitalize">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                          ID: {user.id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Mail size={14} />
                        <span className="text-sm">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                        <Phone size={14} />
                        <span className="text-xs">{user.phone || "No Phone"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-slate-400" />
                      <span className="text-sm">
                        {new Date(user.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                      user.status === 'ACTIVE' 
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                    }`}>
                      {user.status === 'ACTIVE' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 gap-2 border border-rose-200 dark:border-rose-500/20">
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                  No users found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}