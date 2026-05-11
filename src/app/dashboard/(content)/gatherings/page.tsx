"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Trash2, Calendar, Users, Mic, Upload, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoSkeleton from "../../../loading-skeletons/video-skeleton";
import { getGatheringsAction, deleteGatheringAction } from "@/app/gatheringActions";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import GatheringEditSheet from "../../components/GatheringEditSheet";

export default function GatheringsList() {
  const { toast } = useToast();
  const confirm = useConfirm();
  const handleUnauthorized = useAuthRedirect();
  const router = useRouter();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editSheet, setEditSheet] = useState<{ open: boolean; gathering: any | null }>({ open: false, gathering: null });

  useEffect(() => {
    const fetchGatherings = async () => {
      try {
        const result = await getGatheringsAction();
        if (handleUnauthorized(result)) return;
        if (result.success) {
          const items = result.data?.data?.items || result.data?.items || result.data?.data || [];
          setData(Array.isArray(items) ? items : []);
        } else {
          console.error("Gatherings fetch error:", result.message);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGatherings();
  }, []);

  const deleteHandler = async (id: string) => {
    const ok = await confirm({
      title: "Delete Gathering",
      message: "This will permanently delete the gathering and all associated data.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    const res = await deleteGatheringAction(id);
    if (res.success) {
      setData((prev) => prev.filter((g) => g.id !== id));
      toast({ type: "success", title: "Gathering deleted", message: "The gathering has been removed." });
    } else {
      toast({ type: "error", title: "Delete failed", message: res.error });
    }
  };

  const openEdit = (gathering: any) => setEditSheet({ open: true, gathering });

  const handleUpdated = (updated: any) => {
    setData((prev) => prev.map((g) => g.id === updated.id ? { ...g, ...updated } : g));
  };

  const filtered = data.filter((g) =>
    g.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <GatheringEditSheet
        gathering={editSheet.gathering}
        open={editSheet.open}
        setOpen={(v) => setEditSheet((s) => ({ ...s, open: v }))}
        onUpdated={handleUpdated}
      />

      <div className="w-full rounded-2xl border bg-white dark:bg-[#111318] border-slate-200 dark:border-slate-800 overflow-hidden">

        {/* Header */}
        <div className="p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Gatherings List</h2>
          </div>

          <div className="flex items-center w-full lg:w-72 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 overflow-hidden focus-within:ring-2 focus-within:ring-amber-500/50 transition-all">
            <div className="px-3 py-2 border-r border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/30">
              <Search className="text-slate-400 dark:text-slate-500" size={18} />
            </div>
            <input
              type="text"
              placeholder="Search gatherings…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-sm outline-none text-slate-900 dark:text-slate-200 placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="text-slate-400 dark:text-slate-500 text-sm font-medium border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-transparent">
                <th className="px-6 py-4">Gatherings</th>
                <th className="px-6 py-4">Speakers</th>
                <th className="px-6 py-4">Tracks</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <VideoSkeleton key={i} />)
              ) : filtered.length > 0 ? (
                filtered.map((gathering: any) => {
                  const formattedDate = gathering.createdAt
                    ? new Date(gathering.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "2-digit", year: "numeric",
                      })
                    : "—";

                  const speakerCount = gathering.speakers?.length ?? 0;
                  const tracks: any[] = Array.isArray(gathering.tracks) ? gathering.tracks : [];

                  return (
                    <tr key={gathering.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative shrink-0 w-20 h-12 rounded-md overflow-hidden bg-slate-900 border border-slate-100 dark:border-slate-700">
                            {gathering.coverPhotoUrl || gathering.thumbnailUrl ? (
                              <Image
                                src={gathering.coverPhotoUrl || gathering.thumbnailUrl}
                                alt={gathering.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-amber-500/10">
                                <Mic size={18} className="text-amber-500" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <button
                              onClick={() => openEdit(gathering)}
                              className="font-semibold text-slate-900 dark:text-slate-200 truncate max-w-52 text-left hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                            >
                              {gathering.title}
                            </button>
                            {gathering.description && (
                              <span className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-52 mt-0.5">
                                {gathering.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <Users size={14} />
                          <span>{speakerCount} speaker{speakerCount !== 1 ? "s" : ""}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {tracks.length > 0 ? (
                          <div className="flex flex-col gap-1.5">
                            {tracks.map((track: any) => (
                              <span key={track.id} className="w-fit text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full">
                                {track.name || track.title || "Track"}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500">No tracks</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          {formattedDate}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const firstTrack = tracks[0];
                              if (firstTrack) {
                                router.push(`/dashboard/gatherings/${gathering.id}/upload-episode?title=${encodeURIComponent(gathering.title)}&trackId=${firstTrack.id}&trackName=${encodeURIComponent(firstTrack.name || firstTrack.title || "Track")}`);
                              }
                            }}
                            disabled={tracks.length === 0}
                            className="px-4 text-xs font-medium rounded-sm border-amber-600/20 bg-amber-600/10 text-amber-600 hover:bg-amber-600/20 gap-2 transition-colors disabled:opacity-40"
                          >
                            <Upload size={16} strokeWidth={2.5} />
                            Upload Track
                          </Button>
                          <Button
                            onClick={() => deleteHandler(gathering.id)}
                            variant="outline"
                            size="sm"
                            className="text-xs font-medium rounded-sm border-rose-500/15 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 gap-2 transition-all"
                          >
                            <Trash2 size={16} strokeWidth={2.5} />
                            Delete
                          </Button>
                          <Button
                            onClick={() => openEdit(gathering)}
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
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                        <Mic size={28} className="text-slate-300 dark:text-slate-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">No gatherings yet</p>
                        <p className="text-sm text-slate-500 mt-1">
                          {search ? `No results for "${search}"` : "Create your first gathering from the Upload page."}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
