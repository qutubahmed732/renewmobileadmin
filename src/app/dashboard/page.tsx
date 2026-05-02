"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";


import UserSignupChart from "./components/ChartCompound";
import UsersList from "./components/UsersList";
import { getUsersAction, getVideosAction, getSeriesAction, getSmallGroupsAction } from "@/app/action"

export default function Dashboard() {

  const [data, setData] = useState([]);
  const [videos, setVideos] = useState([]);
  const [series, setSeries] = useState([]);
  const [smallGroup, setSmallGroup] = useState([]);
  const [loading, setLoading] = useState(true);



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
    // PARALLEL API CALLS - All 4 requests happen simultaneously
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authorized token");

        // Promise.all makes all 4 calls in parallel instead of sequential
        const [usersResult, videosResult, seriesResult, smallGroupResult] = await Promise.all([
          getUsersAction(token),
          getVideosAction(token),
          getSeriesAction(token),
          getSmallGroupsAction(token),
        ]);

        // Process results
        if (usersResult.success) {
          setData(usersResult.data?.data?.items || []);
        } else {
          console.error("Users error:", usersResult.message);
        }

        if (videosResult.success) {
          setVideos(videosResult.data?.data?.items || []);
        } else {
          console.error("Videos error:", videosResult.message);
        }

        if (seriesResult.success) {
          setSeries(seriesResult.data?.data?.items || []);
        } else {
          console.error("Series error:", seriesResult.message);
        }

        if (smallGroupResult.success) {
          setSmallGroup(smallGroupResult.data?.data?.items || []);
        } else {
          console.error("Small Group error:", smallGroupResult.message);
        }

      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
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
                {loading ? "..." : item.value}
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