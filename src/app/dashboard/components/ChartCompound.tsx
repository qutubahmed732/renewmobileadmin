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

interface MonthlyDataItem {
  month: string;
  count: number;
}

export default function UserSignupChart({ 
  monthlyData 
}: { 
  monthlyData?: MonthlyDataItem[] 
}) {

  const chartData = useMemo(() => {
    // Agar backend se data aa raha hai toh wahi use karo
    if (monthlyData && Array.isArray(monthlyData)) {
      return monthlyData;
    }

    // Agar data loading par hai ya nahi mila toh khali array bhej do
    return [];
  }, [monthlyData]);

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