"use client"

import { useState, useEffect } from "react"
import { Search, Trash2, LucideDownloadCloud, Loader2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getTeamMembersAction } from "@/app/action"

export default function ManageMember() {
  const [search, setSearch] = useState("")
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getTeamMembers() {
      try {
        setLoading(true);
        const token = localStorage.getItem("authorized token");
        const result = await getTeamMembersAction(token);

        if (result.success) {
          const items = result.data?.data?.items || result.data?.items || [];
          setData(items);
        } else {
          console.error("Action Error:", result.message);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    getTeamMembers()
  }, [])

  const filtered = data.filter((m: any) => {
    const fullName = `${m.firstName || ""} ${m.lastName || ""}`.toLowerCase();
    const email = (m.email || "").toLowerCase();
    const query = search.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  return (
    <div className="w-full rounded-xl border bg-white dark:bg-[#111318] border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">
      
      {/* Header: Fully Responsive */}
      <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Manage Members
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              View and manage your organization's team members.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>

            <Button className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white gap-2 h-10 px-5 rounded-lg font-semibold shadow-sm">
              <LucideDownloadCloud size={18} />
              Add Member
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
            <p className="text-slate-500 font-medium animate-pulse">Fetching members...</p>
          </div>
        ) : (
          <>
            {/* 1. DESKTOP VIEW: Hidden on mobile (md breakpoint) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-white/2 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4">Member Info</th>
                    <th className="px-6 py-4">Email Address</th>
                    <th className="px-6 py-4">Phone Number</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {filtered.map((member: any) => (
                    <tr key={member.id} className="hover:bg-slate-50/80 dark:hover:bg-white/3 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar with Initials */}
                          <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-500 font-bold text-sm">
                            {member.firstName?.[0]}{member.lastName?.[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 dark:text-slate-100">
                              {member.firstName} {member.lastName}
                            </span>
                            <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded w-fit uppercase">
                              {member.role?.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{member.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500 dark:text-slate-400">{member.phone || "Not provided"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 gap-2 border border-transparent hover:border-rose-100 transition-all">
                          <Trash2 size={16} />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 2. MOBILE VIEW: Cards displayed only on small screens */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((member: any) => (
                <div key={member.id} className="p-4 bg-white dark:bg-transparent">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white leading-none">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-[10px] font-bold text-amber-600 uppercase mt-1 tracking-wider">
                          {member.role?.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-rose-500 h-8 w-8">
                      <Trash2 size={18} />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 text-sm ml-13">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs w-12 italic">Email:</span>
                      <span className="text-slate-700 dark:text-slate-300 truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs w-12 italic">Phone:</span>
                      <span className="text-slate-700 dark:text-slate-300">{member.phone || "N/A"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filtered.length === 0 && !loading && (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="h-16 w-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                  <Search className="text-slate-300" size={32} />
                </div>
                <p className="text-slate-500 text-sm font-medium">No results found for "{search}"</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}