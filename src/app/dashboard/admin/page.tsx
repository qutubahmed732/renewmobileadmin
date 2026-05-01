"use client"
// https://application.renew.org/admin/team-members?page=1&limit=10&order=ASC
import { useState } from "react"
import { Search, UserPlus, Trash2, LucideDownloadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"

const membersData = [
  {
    id: 1,
    name: "Ops Admin",
    role: "ADMIN",
    email: "ops.admin@renew.org",
    phone: "N/A"
  },
  {
    id: 2,
    name: "Mason Eagle",
    role: "ADMIN",
    email: "mason@discipleship.org",
    phone: "6155853774"
  },
  {
    id: 3,
    name: "Wes Woodell",
    role: "ADMIN",
    email: "dubya.digital@gmail.com",
    phone: "00000000"
  }
]

export default function ManageMember() {
  const [search, setSearch] = useState("")

  const filtered = membersData.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="w-full rounded-lg border bg-white dark:bg-[#111318] border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
      <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Manage Member</h2>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center w-full sm:w-72 rounded-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 overflow-hidden focus-within:ring-2 focus-within:ring-amber-500/50 transition-all">
            <div className="px-3 py-2 border-r border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/30">
              <Search className="text-slate-400 dark:text-slate-500" size={18} />
            </div>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-sm outline-none text-slate-900 dark:text-slate-200 placeholder:text-slate-500"
            />
          </div>

          <Button className="w-full sm:w-auto bg-[#eab308] hover:bg-[#ca8a04] text-white gap-2 px-4 py-2 rounded-sm font-medium transition-all">
            <LucideDownloadCloud size={18} />
            Add Member
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 dark:text-slate-500 text-[1rem] border-b border-slate-100 dark:border-slate-800">
              <th className="px-6 py-4">Members</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Phone Number</th>
              <th className="px-6 py-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((member) => (
              <tr key={member.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/2 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-slate-200">{member.name}</span>
                    <span className="text-sm text-slate-400 dark:text-slate-500 tracking-wider uppercase">{member.role}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-[1rem] text-slate-900 dark:text-slate-200">
                  {member.email}
                </td>
                <td className="px-6 py-4 text-[1rem] text-slate-900 dark:text-slate-200">
                  {member.phone}
                </td>
                <td className="px-6 py-4 text-left">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 gap-2 border border-rose-200 dark:border-rose-500/20"
                  >
                    <Trash2 size={16} />
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}