"use client"

import { useState, useEffect, useRef } from "react"
import Sidebar from "./sidebar"
import { Button } from "@/components/ui/button"
import { Menu, LogOut, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import ThemeBtn from "@/context/ThemeButton"
import { clearAuthCookie } from "@/lib/auth-cookies"

export default function DashboardClientWrapper({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const [heading, setHeading] = useState<string | null>("Dashboard Overview")
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [])

  const handleLogout = async () => {
    await clearAuthCookie();
    router.push("/");
  }

  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false)

    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false)
      else setSidebarOpen(true)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const exact: Record<string, string> = {
      "/dashboard": "Dashboard Overview",
      "/dashboard/users": "Users",
      "/dashboard/admin": "Admin",
      "/dashboard/videos": "Videos Content",
      "/dashboard/series": "Series Content",
      "/dashboard/small-group": "Small Groups",
      "/dashboard/gatherings": "Gatherings",
      "/dashboard/upload": "Upload",
      "/dashboard/profile": "Profile",
    }
    const prefix: [string, string][] = [
      ["/dashboard/gatherings/", "Gatherings"],
      ["/dashboard/series/", "Series Content"],
      ["/dashboard/small-group/", "Small Groups"],
      ["/dashboard/videos/", "Videos Content"],
    ]
    const matched = exact[pathname] ?? prefix.find(([p]) => pathname.startsWith(p))?.[1] ?? "Dashboard"
    setHeading(matched)
  }, [pathname])

  return (
    <div className="flex h-screen bg-white dark:bg-[#111318] text-slate-900 dark:text-white transition-colors duration-300">
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0 transition-all duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-0"
      )}>
        <Sidebar isOpen={isSidebarOpen} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-[#111318] shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu size={20} className="transition-transform" />
            </Button>
            <h1 className="text-base sm:text-lg font-semibold truncate">{heading}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <ThemeBtn />
            </div>
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(prev => !prev)}
                className="rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-[#111318]"
              >
                <Image src="/logo.png" alt="Profile" width={40} height={40} className="bg-amber-500 rounded-full shrink-0 object-cover" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-48 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d24] shadow-lg shadow-slate-200/50 dark:shadow-black/40 overflow-hidden z-50">
                  <button
                    onClick={() => { setProfileOpen(false); router.push("/dashboard/profile"); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <User size={16} className="text-slate-400" />
                    Profile & Security
                  </button>
                  <div className="h-px bg-slate-100 dark:bg-slate-700" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-[#0b0c10]">
          <div className="max-w-350 mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}