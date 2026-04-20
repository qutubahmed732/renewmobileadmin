"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { cn } from "@/lib/utils";

// Sample Data
const data = [
  { month: "Nov 2025", count: 0 },
  { month: "Dec 2025", count: 0 },
  { month: "Jan 2026", count: 0 },
  { month: "Feb 2026", count: 16 },
  { month: "Mar 2026", count: 13 },
  { month: "Apr 2026", count: 24 },
];

export default function UserSignupChart() {
  return (
    <div className={cn(
      "w-full h-100 p-6 rounded-2xl border transition-all duration-300",
      "bg-white border-slate-200",
      "dark:bg-[#111318] dark:border-slate-800"
    )}>
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
          Total Users Sign Up
        </h3>
        <button className="text-xs px-3 py-1 rounded-md border transition-colors bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-700">
          Past 6 months
        </button>
      </div>

      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 60 }}>
          <CartesianGrid
            vertical={false}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
            strokeDasharray="0"
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'currentColor', fontSize: 11 }}
            className="text-slate-400 dark:text-slate-500"
            dy={10}
            angle={-45}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'currentColor', fontSize: 12 }}
            className="text-slate-400 dark:text-slate-500"
            domain={[0, 24]}
            ticks={[0, 4, 8, 12, 16, 20, 24]}
          />
          <Tooltip
            cursor={{ fill: 'currentColor', className: 'text-slate-100 dark:text-white/5' }}
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg)',
              border: '1px solid var(--tooltip-border)',
              borderRadius: '12px',
              fontSize: '12px'
            }}
            wrapperClassName="dark:![--tooltip-bg:#1c1f26] ![--tooltip-bg:#ffffff] dark:![--tooltip-border:#334155] ![--tooltip-border:#e2e8f0]"
          />
          <Bar
            dataKey="count"
            fill="#f59e0b"
            radius={[6, 6, 0, 0]}
            barSize={32}
            className="hover:opacity-80 transition-opacity"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}