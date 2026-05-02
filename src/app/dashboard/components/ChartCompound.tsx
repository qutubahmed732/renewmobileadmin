"use client"

import { useMemo } from "react";
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

interface User {
  createdAt: string;
}

export default function UserSignupChart({ users = [] }: { users: User[] }) {

  const mockUsers = [
    { createdAt: "2026-03-10T10:00:00Z" },
    { createdAt: "2026-03-15T10:00:00Z" },
    { createdAt: "2026-03-25T10:00:00Z" },
    { createdAt: "2026-04-05T10:00:00Z" },
    { createdAt: "2026-04-12T10:00:00Z" },
    { createdAt: "2026-04-28T10:00:00Z" },
    { createdAt: "2026-04-29T10:00:00Z" },
    { createdAt: "2026-02-15T10:00:00Z" },
  ];

  // const displayUsers = users.length > 0 ? users : mockUsers;

  const chartData = useMemo(() => {
    const monthsMap: Record<string, number> = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthsMap[label] = 0;
    }

    users.forEach(user => {
      const date = new Date(user.createdAt);
      if (!isNaN(date.getTime())) {
        const label = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        if (monthsMap[label] !== undefined) {
          monthsMap[label]++;
        }
      }
    });

    return Object.entries(monthsMap).map(([month, count]) => ({
      month,
      count
    }));
  }, [users]);

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
        <span className="text-xs px-3 py-1 rounded-md border bg-slate-50 dark:bg-slate-800 text-slate-500 dark:border-slate-700">
          Past 6 months
        </span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'currentColor', fontSize: 11 }}
            className="text-slate-400"
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'currentColor', fontSize: 12 }}
            className="text-slate-400"
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(245, 158, 11, 0.1)' }}
            contentStyle={{
              borderRadius: '12px',
              backgroundColor: '#111318',
              border: '1px solid #334155',
              color: '#fff'
            }}
            itemStyle={{ color: '#f59e0b' }}
          />
          <Bar
            dataKey="count"
            fill="#f59e0b"
            radius={[4, 4, 0, 0]}
            barSize={40}
            animationDuration={1500}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}