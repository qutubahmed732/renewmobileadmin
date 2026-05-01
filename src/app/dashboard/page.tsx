"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";


import UserSignupChart from "./components/ChartCompound";
import UsersList from "./components/UsersList";

export default function Dashboard() {

  const [data, setData] = useState([]);
  const [videos, setVideos] = useState([]);
  const [series, setSeries] = useState([]);
  const [smallGroup, setSmallGroup] = useState([])


  const stats = [
    {
      title: "Total Users",
      value: data?.length || "...",
      icon: <Info size={16} className="text-slate-500" />,
    },
    {
      title: "Total Videos",
      value: videos?.length || "...",
      icon: <Info size={16} className="text-slate-500" />,
    },
    {
      title: "Total Series",
      value: series?.length || "...",
      icon: <Info size={16} className="text-slate-500" />,
    },
    {
      title: "Total Small Group",
      value: smallGroup?.length || "...",
      icon: <Info size={16} className="text-slate-500" />,
    },
  ];

  useEffect(() => {

    // all users
    const fetchUsersData = async () => {
      try {
        const response = await fetch("/dashboard/api", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authorized token")}`
          }
        });
        if (!response.ok) throw new Error("Failed to fetch");

        const result = await response.json();

        setData(result?.data?.items || []);
        
      } catch (err) {
        console.error("Fetch error:", err);
        
      }
    };
    fetchUsersData();

    // all videos
    const fetchVideosData = async () => {
      try {
        const response = await fetch("/dashboard/videos/api", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authorized token")}`
          }
        });
        if (!response.ok) throw new Error("Failed to fetch");

        const result = await response.json();
        setVideos(result?.data?.items || []);
        
      } catch (err) {
        console.error("Fetch error:", err);
        
      }
    };
    fetchVideosData();

    // all series
    const fetchSeriesData = async () => {
      try {
        const response = await fetch("/dashboard/series/api", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authorized token")}`
          }
        });
        if (!response.ok) throw new Error("Failed to fetch");

        const result = await response.json();
        setSeries(result?.data?.items);
        ;

      } catch (err) {
        console.error("Fetch error:", err);
        
      }
    };
    fetchSeriesData();

    // small group data
    const fetchSmallGroupData = async () => {
      try {
        const response = await fetch("/dashboard/small-group/api", {
          method: "GET",
          headers: {

            Authorization: `Bearer ${localStorage.getItem("authorized token")}`
          }
        });
        if (!response.ok) throw new Error("Failed to fetch");

        const result = await response.json();
        setSmallGroup(result?.data?.items || []);
        
      } catch (err) {
        console.error("Fetch error:", err);
        
      }
    };
    fetchSmallGroupData();

  }, []);


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
                {item.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <UserSignupChart users={data} />
      <UsersList />

    </section>
  )
};