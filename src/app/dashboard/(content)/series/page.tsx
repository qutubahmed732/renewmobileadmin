"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Trash2,
  Edit3,
  Eye,
  Calendar,
  Upload,
} from "lucide-react"
import { SeriesDetailSheet } from "@/components/SeriesDetailSheet";
import { Button } from "@/components/ui/button";
import VideoSkeleton from "../../../loading-skeletons/video-skeleton";
import Image from "next/image";
import { getSeriesAction } from "@/app/loadAction";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { deleteSeriesAction } from "@/app/deleteAction";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/toast";

export default function SeriesList() {
  const router = useRouter()
  const { toast } = useToast();
  const confirm = useConfirm();
  const handleUnauthorized = useAuthRedirect();
  const [search, setSearch] = useState("")

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSeries, setSelectedSeries] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);


  useEffect(() => {
    const fetchSeriesData = async () => {
      try {
        const result = await getSeriesAction();

        if (handleUnauthorized(result)) return;
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

    fetchSeriesData();
  }, []);


  const handleRowClick = (series: any) => {
    setSelectedSeries(series);
    setIsSheetOpen(true);
  };

  const filteredSeries = data?.filter((s: any) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleEditClick = (series: any) => {
    localStorage.setItem("editData", JSON.stringify(series));
    localStorage.setItem("editType", "series");
    router.push(`/dashboard/series/${series.id}`);
  };

  const deleteHandler = async (id: string) => {
    const ok = await confirm({
      title: "Delete Series",
      message: "This will permanently delete the series and all associated data.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    const res = await deleteSeriesAction(id);
    if (res.success) {
      setData((prev: any) => prev.filter((s: any) => s.id !== id));
      setIsSheetOpen(false);
      toast({ type: 'success', title: 'Series deleted', message: 'The series has been removed.' });
    } else {
      toast({ type: 'error', title: 'Delete failed', message: res.error });
    }
  }

  return (
    <div className="w-full rounded-2xl border bg-white dark:bg-[#111318] border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Series List</h2>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center w-full sm:w-72 rounded-lg border ...">
            <div className="px-3 py-2 ...">
              <Search className="text-slate-400 dark:text-slate-500" size={18} />
            </div>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-sm outline-none ..."
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">

            {/* <Button
                type="button"
                onClick={handleCreateClick}
                className="flex-1 sm:flex-none bg-[#eab308] ..."
              >
                <Plus size={18} />
                Create Series
              </Button> */}
          </div>
        </div>
      </div>

      <div className="w-full border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/50 overflow-hidden">

        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          <table className="w-full text-left min-w-250 border-collapse">
            <thead>
              <tr className="text-slate-400 dark:text-slate-500 text-sm font-medium border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5">
                <th className="px-6 py-4">Series</th>
                <th className="px-6 py-4">Visibility</th>
                <th className="px-6 py-4 text-center">Publish Date</th>
                {/* <th className="px-6 py-4 text-center">Episodes</th> */}
                <th className="px-6 py-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {!loading ? filteredSeries?.map((series: any) => {
                const formattedDate = new Date(series?.createdAt).toLocaleDateString('en-US', {
                  month: 'short', day: '2-digit', year: 'numeric'
                });

                return (
                  <tr key={series.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0 w-20 h-12 rounded-sm bg-slate-800 overflow-hidden border border-slate-100 dark:border-slate-700">
                          <Image
                            src={series.thumbnailUrl}
                            alt=""
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover"
                          />
                        </div>

                        <span onClick={() => handleRowClick(series)} className="font-semibold cursor-pointer text-slate-900 dark:text-slate-200 truncate max-w-45 lg:max-w-75">
                          {series.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-emerald-500">
                        <Eye size={16} />
                        <span className="font-medium">{series.visibility}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <Calendar size={14} />
                        {formattedDate}
                      </div>
                    </td>
                    {/* <td className="px-6 py-4 text-center font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {series.episodes}
                      </td> */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/series/${series.id}/upload-episode?title=${encodeURIComponent(series.title)}`)}
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
                          onClick={() => deleteHandler(series?.id)}
                          variant="outline"
                          size="sm"
                          className="text-xs font-medium rounded-sm border-rose-500/15 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 gap-2 transition-all"
                        >
                          <Trash2 size={16} strokeWidth={2.5} />
                          Delete
                        </Button>

                        <Button
                          onClick={() => handleEditClick(series)}
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
              }) : <VideoSkeleton />}
            </tbody>
          </table>
        </div>
      </div>

      <SeriesDetailSheet
        series={selectedSeries}
        open={isSheetOpen}
        setOpen={setIsSheetOpen}
        onDelete={deleteHandler}
      />

    </div>
  )
}

{/* <td className="px-6 py-4">
    <div className="flex flex-wrap gap-2">

      <Button
        variant="outline"
        size="sm"
        className="px-4 text-xs font-medium rounded-sm border-amber-600/20 bg-amber-600/10 text-amber-600 hover:bg-amber-600/20 gap-2 transition-colors"
      >
        <Upload size={16} strokeWidth={2.5} />
        Upload Episode
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="text-xs font-medium rounded-sm text-slate-400 hover:text-slate-300 gap-2 transition-all"
      >
        Batch Upload
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="text-xs font-medium rounded-sm border-rose-500/15 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 gap-2 transition-all"
      >
        <Trash2 size={16} strokeWidth={2.5} />
        Delete
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="text-xs font-medium rounded-sm text-slate-400 hover:text-slate-300 gap-2 transition-all"
      >
        <Edit3 size={16} strokeWidth={2.5} />
        Edit
      </Button>
    </div>
  </td> */}