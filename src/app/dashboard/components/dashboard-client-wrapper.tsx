"use client"

import { useState, useEffect } from "react"
import Sidebar from "./sidebar"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import Image from "next/image"
import ThemeBtn from "@/context/ThemeButton"

export default function DashboardClientWrapper({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const [heading, setHeading] = useState<string | null>("Dashboard Overview")
  const pathname = usePathname()

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
    const routes: Record<string, string> = {
      "/dashboard": "Dashboard Overview",
      "/dashboard/users": "Users",
      "/dashboard/admin": "Admin",
      "/dashboard/videos": "Videos Content",
      "/dashboard/series": "Series Content",
      "/dashboard/small-groups": "Small Groups",
      "/dashboard/upload": "Upload",
      "/dashboard/profile": "Profile"
    }
    setHeading(routes[pathname] || "Dashboard")
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
            <div>
              <Image src="/logo.png" alt="Profile" width={40} height={40} className="bg-amber-500 rounded-full shrink-0 object-cover" />
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