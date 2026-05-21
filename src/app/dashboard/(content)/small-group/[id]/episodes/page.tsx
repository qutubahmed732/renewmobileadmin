"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Film,
  Loader2,
  Pencil,
  Trash2,
  Clock,
  UsersRound,
} from "lucide-react";
import { getSmallGroupDetailAction, getSmallGroupVideosAction } from "@/app/loadAction";
import { deleteVideoAction } from "@/app/deleteAction";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/toast";
import EpisodeEditSheet from "@/app/dashboard/components/EpisodeEditSheet";

interface Episode {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  status?: string;
  duration?: number;
}

interface SmallGroupDetail {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SmallGroupEpisodesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: groupId } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const confirm = useConfirm();

  const [group, setGroup] = useState<SmallGroupDetail | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [editEpisode, setEditEpisode] = useState<{ open: boolean; episode: Episode | null }>({
    open: false,
    episode: null,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [detailRes, videosRes] = await Promise.all([
      getSmallGroupDetailAction(groupId),
      getSmallGroupVideosAction(groupId),
    ]);

    if (detailRes.success) {
      const g = detailRes.data?.data ?? detailRes.data;
      setGroup(g);
    } else {
      toast({ type: "error", title: "Failed to load", message: "Could not load small group details." });
    }

    if (videosRes.success) {
      const items = videosRes.data?.data?.items ?? videosRes.data?.items ?? videosRes.data ?? [];
      setEpisodes(Array.isArray(items) ? items : []);
    }

    setLoading(false);
  }, [groupId, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDeleteEpisode = async (episode: Episode) => {
    const ok = await confirm({
      title: "Delete Episode",
      message: `Delete "${episode.title}"? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    const res = await deleteVideoAction(episode.id);
    if (res.success) {
      setEpisodes((prev) => prev.filter((e) => e.id !== episode.id));
      toast({ type: "success", title: "Episode deleted", message: `"${episode.title}" has been removed.` });
    } else {
      toast({ type: "error", title: "Delete failed", message: res.error || "Could not delete episode." });
    }
  };

  const handleEpisodeUpdated = (updated: Partial<Episode> & { id: string }) => {
    setEpisodes((prev) => prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0d0f14] p-6 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-amber-500" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0d0f14] p-6">
        <button
          onClick={() => router.push("/dashboard/small-group")}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back to Small Groups
        </button>
        <p className="text-slate-500">Small group not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d0f14] p-6">
      <EpisodeEditSheet
        episode={editEpisode.episode}
        open={editEpisode.open}
        setOpen={(v) => setEditEpisode((s) => ({ ...s, open: v }))}
        onUpdated={handleEpisodeUpdated}
      />

      <div className="max-w-4xl mx-auto space-y-6">

        <button
          onClick={() => router.push("/dashboard/small-group")}
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Small Groups
        </button>

        {/* Group header */}
        <div className="bg-white dark:bg-[#111318] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center gap-4 p-6">
            <div className="relative shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-slate-900 border border-slate-100 dark:border-slate-700">
              {group.thumbnailUrl ? (
                <Image src={group.thumbnailUrl} alt={group.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-amber-500/10">
                  <UsersRound size={18} className="text-amber-500" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{group.title}</h1>
              {group.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{group.description}</p>
              )}
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {episodes.length} {episodes.length === 1 ? "episode" : "episodes"}
              </p>
            </div>
          </div>
        </div>

        {/* Episodes */}
        {episodes.length === 0 ? (
          <div className="bg-white dark:bg-[#111318] rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mx-auto mb-4">
              <Film size={28} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="font-semibold text-slate-900 dark:text-white">No episodes yet</p>
            <p className="text-sm text-slate-500 mt-1">Upload episodes from the Small Groups list page.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#111318] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-white/[0.02]">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Episodes</h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {episodes.map((episode) => (
                <div
                  key={episode.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="relative shrink-0 w-20 h-12 rounded-md overflow-hidden bg-slate-900 border border-slate-100 dark:border-slate-700">
                    {episode.thumbnailUrl ? (
                      <Image src={episode.thumbnailUrl} alt={episode.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film size={16} className="text-slate-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{episode.title}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {episode.status && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          ["PUBLISHED", "READY"].includes(episode.status.toUpperCase())
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        }`}>
                          {episode.status}
                        </span>
                      )}
                      {episode.duration ? (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock size={10} /> {formatDuration(episode.duration)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-1">
                    <button
                      onClick={() => setEditEpisode({ open: true, episode })}
                      className="text-slate-300 dark:text-slate-600 hover:text-amber-500 dark:hover:text-amber-400 transition-colors p-1"
                      title="Edit episode"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteEpisode(episode)}
                      className="text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-1"
                      title="Delete episode"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
