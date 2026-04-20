"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

import UserSignupChart from "./components/ChartCompound";
import UsersList from "./components/UsersList";

export default function Dashboard() {

  const stats = [
    {
      title: "Total Users",
      value: "49",
      icon: <Info size={16} className="text-slate-500" />,
    },
    {
      title: "Total Videos",
      value: "102",
      icon: <Info size={16} className="text-slate-500" />,
    },
    {
      title: "Total Series",
      value: "16",
      icon: <Info size={16} className="text-slate-500" />,
    },
    {
      title: "Total Small Group",
      value: "3",
      icon: <Info size={16} className="text-slate-500" />,
    },
  ];

  return (
    <section className="flex flex-col gap-3">
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
                {item.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <UserSignupChart />
      <UsersList />

    </section>
  )
};