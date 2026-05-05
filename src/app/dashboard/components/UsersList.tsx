"use client"

import {
  Search,
  Mail,
  Phone,
  Calendar,
  Trash2,
  CheckCircle2,
  Clock
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState, useEffect, useMemo, useCallback } from "react";
import { getUsersAction } from "@/app/loadAction"
import { cn } from "@/lib/utils"

export default function UsersList({ role }: { role: string }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  const fetchUsersData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authorized token");
      const result = await getUsersAction(token, currentPage, 10, role);

      if (result.success) {
        const items = result.data?.data?.items || [];
        setData(items);
        setHasNextPage(items.length === 10);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, role]);

  useEffect(() => {
    fetchUsersData();
  }, [fetchUsersData]);

  const filteredUsers = useMemo(() => {
    return data.filter((user: any) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const searchLower = searchQuery.toLowerCase();
      return (
        fullName.includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.role && user.role.toLowerCase().includes(searchLower))
      );
    });
  }, [data, searchQuery]);

  return (
    <div className="w-full rounded-2xl border bg-white dark:bg-[#111318] border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
      <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          Users List
          {loading && <Clock className="animate-spin text-amber-500" size={16} />}
        </h2>
        
        <div className="flex items-center w-full sm:w-80 rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 overflow-hidden focus-within:ring-2 focus-within:ring-amber-500/50 transition-all">
          <div className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-800 flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/30">
            <Search className="text-slate-400 dark:text-slate-500" size={18} />
          </div>
          <Input
            type="text"
            placeholder="Search name, email or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent px-4 py-2 text-sm border-none focus-visible:ring-0"
          />
        </div>
      </div>

      <div className={cn("overflow-x-auto transition-opacity duration-200", loading ? "opacity-50" : "opacity-100")}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-400 dark:text-slate-500 text-sm font-medium border-b border-slate-100 dark:border-slate-800">
              <th className="px-6 py-4">User Info</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">SignUp Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user: any) => (
                <tr key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full flex items-center justify-center border border-amber-500/20 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <Image src={user.avatarUrl || "/avatar-default.png"} alt="avatar" width={40} height={40} className="object-cover" />
                        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white dark:border-[#111318] rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-400'}`} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-slate-200 capitalize">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          @{user.email.split('@')[0]}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2"><Mail size={14} /> {user.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    <div className="flex items-center gap-2"><Phone size={14} /> {user.phone || "N/A"}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} /> 
                      {new Date(user.createdAt).toLocaleDateString('en-GB')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      user.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                    }`}>
                      {user.status === 'ACTIVE' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 h-8 w-8">
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))
            ) : !loading && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-500">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
        <span className="text-xs font-medium text-slate-500">Page {currentPage}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline" size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1 || loading}
          >Previous</Button>
          <Button
            variant="outline" size="sm"
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={!hasNextPage || loading}
          >Next</Button>
        </div>
      </div>
    </div>
  )
}