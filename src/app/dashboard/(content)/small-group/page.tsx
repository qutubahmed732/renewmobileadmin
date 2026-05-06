"use client"

import {
  Search,
  Trash2,
  Edit3,
  Eye,
  Calendar,
  Upload,
  Users,
  ArrowUpDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react";
import Image from "next/image";
import SmallGroupSkeleton from "../../../loading-skeletons/small-group-skeleton";
import { getSmallGroupsAction } from "@/app/loadAction";
import { SeriesDetailSheet } from "@/components/SeriesDetailSheet";
import { useRouter } from "next/navigation";
import { deleteSmallGroupAction } from "@/app/deleteAction";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/toast";

export default function SmallGroupsTable() {
  const router = useRouter()
  const { toast } = useToast();
  const confirm = useConfirm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSeries, setSelectedSeries] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    const fetchSmallGroupData = async () => {
      try {
        const token = localStorage.getItem("authorized token");
        const result = await getSmallGroupsAction(token);

        if (result.success) {
          setData(result.data?.data?.items || []);
          setLoading(false)
        } else {
          console.error("Action Error:", result.message);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false)
      }
    };
    fetchSmallGroupData();
  }, []);

  const handleRowClick = (series: any) => {
    setSelectedSeries(series);
    setIsSheetOpen(true);
  };

  const handleEditClick = (item: any) => {
    localStorage.setItem("editData", JSON.stringify(item));
    localStorage.setItem("editType", "small-group");
    router.push(`/dashboard/small-group/${item.id}`);
  };

  const deleteHandler = async (id: string) => {
    const token = localStorage.getItem("authorized token");
    if (!token) return;
    const ok = await confirm({
      title: "Delete Small Group",
      message: "This will permanently delete the group and all associated data.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    const res = await deleteSmallGroupAction(id, token as string);
    if (res.success) {
      setData((prev: any) => prev.filter((item: any) => item.id !== id));
      toast({ type: 'success', title: 'Small group deleted', message: 'The group has been removed.' });
    } else {
      toast({ type: 'error', title: 'Delete failed', message: res.error });
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] shadow-2xl overflow-hidden text-slate-600 dark:text-slate-300 transition-colors">

      <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Small Groups List</h2>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-slate-50 dark:bg-[#1a1d24] border border-slate-200 dark:border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
          </div>
          <Button variant="outline" className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1d24] text-slate-600 dark:text-slate-300 gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <ArrowUpDown size={16} /> Sort
          </Button>
          {/* <Button onClick={handleUploadClick} className="bg-[#eab308] hover:bg-[#ca8a04] text-[#111318] gap-2 font-bold border-none transition-transform active:scale-95 shadow-sm">
            <Plus size={20} /> Create Small Group
          </Button> */}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-y border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-sm font-medium text-slate-500 dark:text-slate-500">
              <th className="px-6 py-4 w-10">
                <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 bg-transparent focus:ring-amber-500/50" />
              </th>
              <th className="px-6 py-4 min-w-75">Small Group Videos</th>
              {/* <th className="px-6 py-4">Attachment</th> */}
              <th className="px-6 py-4 text-center">Visibility</th>
              <th className="px-6 py-4 text-center">Publish Date</th>
              <th className="px-6 py-4 text-">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <SmallGroupSkeleton />
            ) : data.length > 0 ? (
              data.map((item: any) => {
                const dateObj = new Date(item.createdAt);

                const formattedDate = dateObj.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                });

                return (
                  <tr key={item.id} className="group hover:bg-slate-50/30 dark:hover:bg-white/2 transition-colors">
                    <td className="px-6 py-8 align-top">
                      <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 bg-transparent mt-1" />
                    </td>

                    <td className="px-6 py-6">
                      <div className="flex gap-4">
                        <div className="w-32 h-20 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 overflow-hidden relative shadow-sm">
                          <div className="w-full h-full bg-linear-to-br from-slate-50 to-slate-200 dark:from-slate-700 dark:to-slate-900 flex items-center justify-center">
                            <Image src={item.thumbnailUrl} alt={item.title} width={50} height={50} className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider w-full h-full" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <h3 onClick={() => handleRowClick(item)} className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 max-w-xl">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* <td className="px-6 py-8 align-top text-slate-400 dark:text-slate-600 italic text-sm"></td> */}

                    <td className="px-6 py-8 align-top">
                      <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-500 font-semibold text-sm bg-emerald-50 dark:bg-emerald-500/5 py-1 px-3 rounded-full w-fit mx-auto border border-emerald-100 dark:border-emerald-500/10">
                        <Eye size={14} />
                        <span>{item.visibility}</span>
                      </div>
                    </td>

                    <td className="px-6 py-8 align-top">
                      <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-500 text-sm">
                        <Calendar size={16} className="text-slate-400 dark:text-slate-600" />
                        <span>{formattedDate}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/small-group/${item.id}/upload-episode?title=${encodeURIComponent(item.title)}`)}
                          className="px-4 text-xs font-medium rounded-sm border-amber-600/20 bg-amber-600/10 text-amber-600 hover:bg-amber-600/20 gap-2 transition-colors"
                        >
                          <Upload size={16} strokeWidth={2.5} />
                          Upload Episode
                        </Button>
                        {/* <Button
                          variant="outline"
                          size="sm"
                          className="text-xs font-medium rounded-sm text-slate-400 hover:text-slate-300 gap-2 transition-all"
                        >
                          Batch Upload
                        </Button> */}
                        <Button
                          onClick={()=> deleteHandler(item.id)}
                          variant="outline"
                          size="sm"
                          className="text-xs font-medium rounded-sm border-rose-500/15 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 gap-2 transition-all"
                        >
                          <Trash2 size={16} strokeWidth={2.5} />
                          Delete
                        </Button>
                        <Button
                          onClick={() => handleEditClick(item)}
                          variant="outline"
                          size="sm"
                          className="text-xs font-medium rounded-sm text-slate-400 hover:text-slate-300 gap-2 transition-all"
                        >
                          <Edit3 size={16} strokeWidth={2.5} />
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (

              <tr>
                <td colSpan={6} className="px-6 py-20">
                  <div className="flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Users size={32} className="text-slate-400 dark:text-slate-600" />
                    </div>
                    <div className="max-w-xs">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        No Groups Found
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Abhi tak koi small group create nahi kiya gaya hai. Naya group banane ke liye 'Create' button par click karein.
                      </p>
                    </div>
                    <Button
                      className="mt-2 bg-amber-500 hover:bg-amber-600 text-white"
                      onClick={() => { }}
                    >
                      Create Your First Group
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SeriesDetailSheet
        series={selectedSeries}
        open={isSheetOpen}
        setOpen={setIsSheetOpen}
      />
    </div>
  )
}