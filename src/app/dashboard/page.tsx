"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";


import UserSignupChart from "./components/ChartCompound";
import { getDashboardStatsAction } from "@/app/loadAction"

export default function Dashboard() {

  const [loading, setLoading] = useState(true);
  const [chartStats, setChartStats] = useState<any>([])

  useEffect(() => {
    // PARALLEL API CALLS - All 4 requests happen simultaneously
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authorized token");

        const [dashboardStatesResult] = await Promise.all([
          getDashboardStatsAction(token)
        ]);

        if (dashboardStatesResult.success) {
          setChartStats(dashboardStatesResult.data)
        } else {
          console.error("Users error:", dashboardStatesResult?.message);
        }

      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const stats = [
    {
      title: "Total Users",
      value: chartStats?.data?.totals?.users || "...",
      icon: <Info size={16} className="text-slate-500" />,
    },
    {
      title: "Total Videos",
      value: chartStats?.data?.totals?.videos || "...",
      icon: <Info size={16} className="text-slate-500" />,
    },
    {
      title: "Total Series",
      value: chartStats?.data?.totals?.series || "...",
      icon: <Info size={16} className="text-slate-500" />,
    },
    {
      title: "Total Small Group",
      value: chartStats?.data?.totals?.groups || "...",
      icon: <Info size={16} className="text-slate-500" />,
    },
  ];

  return (
    <section className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, index) => (
          <Card
            key={index}
            className={cn(
              "transition-all duration-300 border shadow-sm rounded-lg",
              "bg-white border-slate-200 text-slate-900",
              "dark:bg-[#111318] dark:border-slate-800 dark:text-white"
            )}
          >
            <CardHeader className="flex flex-row items-center justify-start space-y-0">
              <CardTitle className="text-1rem font-bold text-slate-500 dark:text-slate-400">
                {item.title}
              </CardTitle>


              <div className="rounded-lg">
                {item.icon}
              </div>
            </CardHeader>

            <CardContent>
              <div className="text-4xl font-bold tracking-tight">
                {loading ? "..." : item.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <UserSignupChart monthlyData={chartStats?.data?.signups?.monthly} />

    </section>
  )
};