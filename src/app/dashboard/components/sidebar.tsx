"use client"

import * as React from "react"
import { LayoutDashboard, Users, Video, Layers, Users2, Settings, Clapperboard, Upload, UserCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"


export default function Sidebar({ isOpen }: { isOpen: boolean }) {

  const pathname = usePathname()

  return (
    <aside className={cn(
      "h-screen overflow-hidden border-r transition-all",
      "bg-white dark:bg-[#111318] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300",
      isOpen ? "w-64" : "w-0"
    )}>
      <div className="p-3">

        <Link href="/" className="flex items-center gap-1 mb-10 px-2 group">

          <div className="relative shrink-0 overflow-hidden rounded-full">
            <Image
              src="/logo.png"
              alt="Logo"
              width={50}
              height={50}
              className="w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]"
            />
          </div>


          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
              RENEW<span className="text-amber-500">.</span>
              <span className="text-slate-400 font-medium lowercase">org</span>
            </span>
          </div>
        </Link>

        <Link
          href="/dashboard/upload"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 mb-4 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
        >
          <Upload size={16} strokeWidth={2.5} />
          Upload Content
        </Link>

        <nav className="space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} link="/dashboard" label="Dashboard" active={pathname === "/dashboard"} />
          <NavItem icon={<Users size={20} />} label="Users" link="/dashboard/users" active={pathname === "/dashboard/users"} />

          <Accordion type="single" collapsible className="w-full border-none">
            <AccordionItem value="content" className={cn(
              "border-none rounded-xl transition-colors",
              "bg-slate-100 dark:bg-slate-800/40"
            )}>
              <AccordionTrigger className="hover:no-underline py-2 px-3 focus:ring-0 items-center">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <Clapperboard size={22} className="text-slate-400" />
                  <span className="text-base font-medium">Content</span>
                </div>
              </AccordionTrigger>

              <AccordionContent className="pt-0 pb-2">
                <div className={cn(
                  "relative space-y-1 border-l-2 mt-2",
                  "border-slate-300 dark:border-slate-700/50"
                )}>
                  <NavItem icon={<Video size={18} />} link="/dashboard/videos" label="Videos" />
                  <NavItem icon={<Layers size={18} />} link="/dashboard/series" label="Series" />
                  <NavItem icon={<Users2 size={18} />} link="/dashboard/small-group" label="Small Groups" />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <NavItem icon={<Settings size={20} />} link="/dashboard/admin" label="Admin" active={pathname === "/dashboard/admin"} />
          <NavItem icon={<UserCircle2 size={20} />} link="/dashboard/profile" label="Profile & Security" active={pathname === "/dashboard/profile"} />
        </nav>
      </div>
    </aside>
  )
}

function NavItem({
  icon,
  label,
  active = false,
  link = ""
}: {
  icon: React.ReactNode,
  label: string,
  active?: boolean,
  link: any
}) {
  return (
    <Link href={link} className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer duration-200 group no-underline!",
      active
        ? "bg-amber-500/10 text-amber-600 dark:text-amber-500 font-semibold"
        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
    )}>
      <div className={cn(
        "transition-colors",
        active ? "text-amber-600 dark:text-amber-500" : "group-hover:text-slate-900 dark:group-hover:text-white"
      )}>
        {icon}
      </div>
      <span className="text-sm">{label}</span>
      {active && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
      )}
    </Link>
  )
}