"use client"

import { useState, useEffect } from "react"
import { Search, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getTeamMembersAction, searchUserByEmailAction } from "@/app/loadAction"
import { useAuthRedirect } from "@/hooks/useAuthRedirect"
import AdminSkeleton from "@/app/loading-skeletons/admin-skeleton"
import { deleteTeamMemberAction, createTeamMemberAction, updateUserRoleAction } from "@/app/deleteAction"
import { useToast } from "@/components/ui/toast"
import { useConfirm } from "@/components/ui/toast"

export default function ManageMember() {
  const [search, setSearch] = useState("")
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [existingMobileUser, setExistingMobileUser] = useState<any>(null);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "", role: "ADMIN",
  });

  const handleUnauthorized = useAuthRedirect();
  const { toast } = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    async function getTeamMembers() {
      try {
        setLoading(true);
        const token = localStorage.getItem("authorized token");
        const result = await getTeamMembersAction(token);

        if (handleUnauthorized(result)) return;
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

  const deleteHandler = async (id: string) => {
    const token = localStorage.getItem("authorized token");
    if (!token) return;
    const ok = await confirm({
      title: "Delete Team Member",
      message: "This will permanently remove this admin from the team.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    const res = await deleteTeamMemberAction(id, token);
    if (res.success) {
      setData((prev: any) => prev.filter((m: any) => m.id !== id));
      toast({ type: "success", title: "Member deleted", message: "The team member has been removed." });
    } else {
      toast({ type: "error", title: "Delete failed", message: res.error });
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setExistingMobileUser(null);
    setForm({ firstName: "", lastName: "", email: "", phone: "", password: "", role: "ADMIN" });
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("authorized token");
    if (!token) return;

    setSubmitting(true);
    setExistingMobileUser(null);
    const body: any = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      role: form.role,
    };
    if (form.phone.trim()) body.phone = form.phone.trim();
    if (form.password.trim()) body.password = form.password.trim();

    const res = await createTeamMemberAction(token, body);
    setSubmitting(false);

    if (res.success) {
      const newMember = res.data?.data || res.data;
      if (newMember?.id) setData((prev) => [...prev, newMember]);
      toast({ type: "success", title: "Member added", message: "New admin has been created successfully." });
      closeModal();
    } else {
      const errMsg = Array.isArray(res.error) ? res.error.join(", ") : (res.error || "");
      const isConflict = errMsg.toLowerCase().includes("exist") || errMsg.toLowerCase().includes("conflict");

      if (isConflict) {
        // Search for the user so we can offer to promote them
        const searchRes = await searchUserByEmailAction(token, form.email.trim());
        const items: any[] = searchRes.data?.data?.items || searchRes.data?.items || [];
        const found = items.find((u: any) => u.email?.toLowerCase() === form.email.trim().toLowerCase());
        if (found) {
          setExistingMobileUser(found);
        } else {
          toast({ type: "error", title: "Failed to add member", message: errMsg });
        }
      } else {
        toast({ type: "error", title: "Failed to add member", message: errMsg });
      }
    }
  };

  const handlePromote = async () => {
    if (!existingMobileUser) return;
    const token = localStorage.getItem("authorized token");
    if (!token) return;

    setPromoting(true);
    const res = await updateUserRoleAction(token, existingMobileUser.id, form.role);
    setPromoting(false);

    if (res.success) {
      const promoted = { ...existingMobileUser, role: form.role };
      setData((prev) => [...prev, promoted]);
      toast({ type: "success", title: "User promoted", message: `${existingMobileUser.firstName} ${existingMobileUser.lastName} is now an ${form.role.replace("_", " ")}.` });
      closeModal();
    } else {
      toast({ type: "error", title: "Promotion failed", message: res.error });
    }
  };

  return (
    <div className="w-full rounded-xl border bg-white dark:bg-[#111318] border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">

      {/* Header */}
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

            <Button
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white gap-2 h-10 px-5 rounded-lg font-semibold shadow-sm"
            >
              Add Member
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="w-full">
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
              {loading ? (
                <AdminSkeleton />
              ) : (
                filtered.map((member: any) => (
                  <tr key={member.id} className="hover:bg-slate-50/80 dark:hover:bg-white/3 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
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
                      <Button
                        onClick={() => deleteHandler(member.id)}
                        variant="ghost"
                        size="sm"
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 gap-2 border border-transparent hover:border-rose-100 transition-all"
                      >
                        <Trash2 size={16} />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        {!loading && (
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((member: any) => (
              <div key={member.id} className="p-4 bg-white dark:bg-transparent">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-500 font-bold text-sm">
                      {member.firstName?.[0]}{member.lastName?.[0]}
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
                  <Button onClick={() => deleteHandler(member.id)} variant="ghost" size="icon" className="text-rose-500 h-8 w-8">
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
        )}

        {filtered.length === 0 && !loading && (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="h-16 w-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
              <Search className="text-slate-300" size={32} />
            </div>
            <p className="text-slate-500 text-sm font-medium">No results found for &quot;{search}&quot;</p>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#111318] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl animate-in fade-in zoom-in-95 duration-200">

            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Team Member</h3>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">First Name <span className="text-rose-500">*</span></label>
                  <input
                    required
                    value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    placeholder="John"
                    className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Last Name <span className="text-rose-500">*</span></label>
                  <input
                    required
                    value={form.lastName}
                    onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                    placeholder="Doe"
                    className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Email <span className="text-rose-500">*</span></label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="john@example.com"
                  className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+1234567890"
                  className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Min. 6 characters"
                  minLength={6}
                  className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>

              {existingMobileUser && (
                <div className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-4 space-y-3">
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    Account already exists
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-400 leading-snug">
                    <span className="font-bold">{existingMobileUser.firstName} {existingMobileUser.lastName}</span> ({existingMobileUser.email}) is already registered as a <span className="font-bold">{existingMobileUser.role?.replace("_", " ")}</span>.
                    {existingMobileUser.role === "MOBILE_USER" && " You can promote them to the selected role instead."}
                  </p>
                  {existingMobileUser.role === "MOBILE_USER" && (
                    <button
                      type="button"
                      onClick={handlePromote}
                      disabled={promoting}
                      className="w-full px-4 py-2.5 text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-sm disabled:opacity-60 transition-all"
                    >
                      {promoting ? "Promoting…" : `Promote to ${form.role.replace("_", " ")}`}
                    </button>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-sm disabled:opacity-60 transition-all"
                >
                  {submitting ? "Adding…" : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}