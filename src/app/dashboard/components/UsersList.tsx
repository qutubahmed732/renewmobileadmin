"use client"

import React from "react"
import { 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  Trash2, 
  MapPin,
  CheckCircle2
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const users = [
  {
    id: 1,
    name: "Mason Eagle",
    handle: "@jpw853",
    email: "jpw853@mocs.utc.edu",
    phone: "N/A",
    address: "N/A",
    signUpDate: "19th February, 2026",
    status: "Active",
  },
  {
    id: 2,
    name: "Chuck Sackett",
    handle: "@sackett.chuck",
    email: "sackett.chuck@gmail.com",
    phone: "+1(217) 257-86",
    address: "United States, Quincy",
    signUpDate: "17th February, 2026",
    status: "Active",
  },
  // ... baaki jub mai data fetch karunga 
]

export default function UsersList() {
  return (
    <div className="w-full rounded-2xl border bg-white dark:bg-[#111318] border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
      
      
      <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Users List</h2>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Search" 
            className="pl-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-amber-500"
          />
        </div>
      </div>

      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-400 dark:text-slate-500 text-sm font-medium border-b border-slate-100 dark:border-slate-800">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Address</th>
              <th className="px-6 py-4">SignUp Date</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((user) => (
              <tr key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/2 transition-colors">
                
                {/* Name Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full flex items-center justify-center border border-amber-500/20">
                      <Image src="/avatar-default.png" alt="avatar" width={24} height={24} className="opacity-80 w-full h-full object-cover" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#111318] rounded-full" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 dark:text-slate-200">{user.name}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{user.handle}</span>
                    </div>
                  </div>
                </td>

                
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Mail size={16} />
                    <span className="text-sm">{user.email}</span>
                  </div>
                </td>

                
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Phone size={16} />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                </td>

                
                <td className="px-6 py-4">
                  <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400">
                    <MapPin size={16} className="mt-0.5 shrink-0" />
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm">{user.address.split(',')[0]}</span>
                      <span className="text-[11px] opacity-60 font-medium">{user.address.split(',')[1] || "N/A"}</span>
                    </div>
                  </div>
                </td>

                
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span className="text-sm">{user.signUpDate}</span>
                  </div>
                </td>

                
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 size={12} />
                    {user.status}
                  </span>
                </td>

                
                <td className="px-6 py-4 text-right">
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