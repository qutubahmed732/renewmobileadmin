"use client"

import {
  Search,
  Mail,
  Phone,
  Calendar,
  Trash2,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState, useEffect, useCallback } from "react";
import { getUsersAction } from "@/app/loadAction"
import { useAuthRedirect } from "@/hooks/useAuthRedirect"
import UsersSkeleton from "@/app/loading-skeletons/users-skeleton"
import { deleteUserAction } from "@/app/deleteAction"
import { useToast } from "@/components/ui/toast"
import { useConfirm } from "@/components/ui/toast"
import { Pagination } from "@/components/ui/pagination"

export default function UsersList({ role }: { role: string }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const handleUnauthorized = useAuthRedirect();
  const { toast } = useToast();
  const confirm = useConfirm();

  // Debounce search input — reset to page 1 when query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const deleteHandler = async (id: string) => {
    const ok = await confirm({
      title: "Delete User",
      message: "This will permanently delete the user and all their data.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    const res = await deleteUserAction(id);
    if (res.success) {
      setData((prev: any) => prev.filter((u: any) => u.id !== id));
      toast({ type: "success", title: "User deleted", message: "The user has been removed." });
    } else {
      toast({ type: "error", title: "Delete failed", message: res.error });
    }
  };

  const fetchUsersData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getUsersAction(currentPage, 10, role, debouncedSearch);

      if (handleUnauthorized(result)) return;
      if (result.success) {
        const page = result.data?.data;
        const items = page?.items || [];
        const total = page?.total ?? page?.totalCount ?? null;
        const limit = 10;
        setData(items);
        if (total !== null) {
          setTotalPages(Math.ceil(total / limit));
          setHasNextPage(currentPage < Math.ceil(total / limit));
        } else {
          setTotalPages(undefined);
          setHasNextPage(items.length === limit);
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, role, debouncedSearch]);

  useEffect(() => {
    fetchUsersData();
  }, [fetchUsersData]);

  return (
    <div className="w-full rounded-2xl border bg-white dark:bg-[#111318] border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
      <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-100 dark:border-slate-800">
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
            className="w-full bg-transparent px-4 py-2 text-sm border-none focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
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
            {loading ? (
              <UsersSkeleton />
            ) : data.length > 0 ? (
              data.map((user: any) => (
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
                    <Button onClick={() => deleteHandler(user.id)} variant="ghost" size="icon" className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 h-8 w-8">
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-500">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        totalPages={totalPages}
        hasNextPage={hasNextPage}
        disabled={loading}
      />
    </div>
  )
}