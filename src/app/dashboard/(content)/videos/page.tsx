"use client"

import Image from "next/image"
import { useState, useEffect, useMemo } from "react"
import {
  Search,
  Upload,
  Trash2,
  Edit3,
  Eye,
  Calendar,
  RefreshCw,
  ArrowLeft,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import VideoSkeleton from "../../../loading-skeletons/video-skeleton"
import { getVideosAction } from "@/app/loadAction"
import { SeriesDetailSheet } from "@/components/SeriesDetailSheet"
import { useRouter } from "next/navigation"

interface VideoItem {
  id: string;
  title: string;
  duration: number;
  status: string;
  visibility: string;
  publishedAt: string;
  thumbnailUrl: string;
  views: number;
  series: { title: string } | null;
  author?: string;
}

export default function VideosList() {
  const [search, setSearch] = useState("")
  const [data, setData] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSeries, setSelectedSeries] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [selectedVideo, setSelectedVideo] = useState(null);

  const router = useRouter()

  useEffect(() => {
    const fetchVideosData = async () => {
      try {
        const token = localStorage.getItem("authorized token");
        const result = await getVideosAction(token);

        if (result.success) {
          setData(result.data?.data?.items || []);
          setLoading(false)
        } else {
          console.error("Action Error:", result.message);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideosData();
  }, []);

  const handleRowClick = (video: any) => {
    const urlParts = video.vimeoVideoUrl?.split('/') || [];
    const hash = urlParts[4] || "";

    setSelectedSeries({
      id: video.id,
      title: video.title,
      description: video.description || "No description available",
      seriesTitle: video.series?.title || "No Series",
      thumbnailUrl: video.thumbnailUrl || "/logo.png",
      videoId: video.vimeoVideoId || urlParts[3],
      videoHash: hash,
      ...video
    });
    setIsSheetOpen(true);
  };

  const filteredData = useMemo(() => {
    return data.filter((video) =>
      video.title?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEditClick = (video: any) => {
    localStorage.setItem("editData", JSON.stringify(video));
    localStorage.setItem("editType", "videos");
    router.push(`/dashboard/videos/${video.id}`);
  };

  // const handleUploadClick = () => {
  //   router.push(`/dashboard/videos/upload`);
  // }

  return (
    <div className="w-full rounded-2xl border bg-white dark:bg-[#111318] border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">

      <div className="p-4 md:p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full lg:w-auto">
          <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white whitespace-nowrap">Videos List</h2>
          {/* <Button variant="outline" className="text-slate-500 border-slate-200 dark:border-slate-800 gap-2 text-[10px] md:text-xs h-8 md:h-9">
            <RefreshCw size={14} />
            <span className="hidden sm:inline">Cleanup Stale Uploads</span>
          </Button> */}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center w-full sm:w-64 md:w-72 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 overflow-hidden focus-within:ring-2 focus-within:ring-amber-500/50 transition-all">
            <div className="px-3 py-2 border-r border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/30">
              <Search className="text-slate-400 dark:text-slate-500" size={18} />
            </div>
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent px-3 py-2 text-sm outline-none text-slate-900 dark:text-slate-200 placeholder:text-slate-500"
            />
          </div>
          {/* <Button onClick={handleUploadClick} className="w-full sm:w-auto bg-[#eab308] hover:bg-[#ca8a04] text-white gap-2 px-4 rounded-lg font-medium h-9 md:h-10">
            <Upload size={18} />
            Upload Video
          </Button> */}
        </div>
      </div>


      <div className="overflow-x-auto scrollbar-thin grow">
        <table className="w-full text-left min-w-250">
          <thead>
            <tr className="text-slate-400 dark:text-slate-500 text-sm font-medium border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-transparent">
              <th className="px-6 py-4 flex items-center gap-2">
                <input type="checkbox" className="rounded border-slate-300" />
                Videos
              </th>
              <th className="px-6 py-4">Status</th>
              {/* <th className="px-6 py-4">Visibility</th> */}
              <th className="px-6 py-4">Publish Date</th>
              <th className="px-6 py-4 text-center">Views</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {!loading ? (
              currentItems.map((video) => {
                const formattedDate = new Date(video.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric'
                });

                return (
                  <tr key={video.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <input type="checkbox" className="rounded border-slate-300" />
                        <div className="relative shrink-0 w-20 md:w-24 h-12 md:h-14 rounded-md overflow-hidden bg-slate-900">
                          <Image
                            src={video.thumbnailUrl || "/logo.png"}
                            alt={video.title}
                            fill
                            className="object-cover"
                          />
                          <span className="absolute bottom-1 right-1 text-[10px] font-bold text-white bg-black/80 px-1 rounded z-10">
                            {formatDuration(video.duration)}
                          </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span onClick={() => handleRowClick(video)} className="font-semibold text-slate-900 dark:text-slate-200 leading-none mb-1 truncate max-w-50">
                            {video.title}
                          </span>
                          <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 truncate max-w-62.5">
                            {video.series?.title || "No Series"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-emerald-500/20">
                        {video.status}
                      </span>
                    </td>
                    {/* <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-emerald-500">
                        <Eye size={16} />
                        <span className="font-medium">{video.visibility}</span>
                      </div>
                    </td> */}
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {formattedDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">
                      {video.views ?? 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-start gap-2">
                        <Button variant="outline" size="sm" className="text-rose-500 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-500/10 h-8">
                          <Trash2 size={14} /> Delete
                        </Button>
                        <Button onClick={() => handleEditClick(video)} variant="outline" size="sm" className="text-slate-500 border-slate-200 dark:border-slate-800 h-8">
                          <Edit3 size={14} /> Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              Array.from({ length: 5 }).map((_, i) => (
                <VideoSkeleton key={i} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (
        <div className="p-4 md:p-6 border-t border-slate-100 dark:border-slate-800 flex justify-center items-center bg-white dark:bg-[#111318]">
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">


            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 disabled:opacity-30 transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ArrowLeft size={18} />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const isVisible =
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

              if (!isVisible) {
                if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <span key={pageNum} className="px-1 text-slate-400">...</span>;
                }
                return null;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border text-sm font-medium transition-all ${currentPage === pageNum
                    ? "bg-[#eab308] border-[#eab308] text-white shadow-lg shadow-amber-500/20"
                    : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 disabled:opacity-30 transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ArrowRight size={18} />
            </button>

          </div>
        </div>
      )}

      <SeriesDetailSheet
        series={selectedSeries}
        open={isSheetOpen}
        setOpen={setIsSheetOpen}
      />
    </div>
  )
}