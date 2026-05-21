"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Plus,
  CloudUpload,
  Trash2,
  Film,
  Loader2,
  Mic,
  Users,
  Clock,
  Pencil,
  ChevronDown,
  ArrowRightLeft,
} from "lucide-react";
import {
  getGatheringDetailAction,
  createGatheringTrackAction,
  deleteGatheringTrackAction,
  updateGatheringTrackAction,
} from "@/app/gatheringActions";
import { deleteVideoAction } from "@/app/deleteAction";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/toast";
import EpisodeEditSheet from "@/app/dashboard/components/EpisodeEditSheet";
import MoveEpisodeSheet from "@/app/dashboard/components/MoveEpisodeSheet";

interface Speaker {
  name: string;
  sortOrder?: number;
}

interface Episode {
  id: string;
  title: string;
  thumbnailUrl?: string;
  status?: string;
  duration?: number;
  speakers?: Speaker[];
}

interface Track {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  episodes?: Episode[];
  videos?: Episode[];
}

interface Gathering {
  id: string;
  title: string;
  description?: string;
  coverPhotoUrl?: string;
  thumbnailUrl?: string;
  tracks?: Track[];
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function GatheringDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: gatheringId } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const confirm = useConfirm();

  const [gathering, setGathering] = useState<Gathering | null>(null);
  const [loading, setLoading] = useState(true);

  const [addTrackFor, setAddTrackFor] = useState(false);
  const [newTrackName, setNewTrackName] = useState("");
  const [newTrackDescription, setNewTrackDescription] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);

  const [editTrack, setEditTrack] = useState<{ id: string; title: string; description: string } | null>(null);
  const [editTrackLoading, setEditTrackLoading] = useState(false);

  const [editEpisode, setEditEpisode] = useState<{ open: boolean; trackId: string; episode: Episode | null }>({
    open: false,
    trackId: "",
    episode: null,
  });

  const [moveEpisode, setMoveEpisode] = useState<{ open: boolean; trackId: string; episode: Episode | null }>({
    open: false,
    trackId: "",
    episode: null,
  });

  const [collapsedTracks, setCollapsedTracks] = useState<Set<string>>(new Set());

  const toggleCollapse = (trackId: string) =>
    setCollapsedTracks((prev) => {
      const next = new Set(prev);
      next.has(trackId) ? next.delete(trackId) : next.add(trackId);
      return next;
    });

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    const res = await getGatheringDetailAction(gatheringId);
    if (res.success) {
      const g = res.data?.data ?? res.data;
      setGathering(g);
    } else {
      toast({ type: "error", title: "Failed to load", message: "Could not load gathering details." });
    }
    setLoading(false);
  }, [gatheringId, toast]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const handleAddTrack = async () => {
    if (!newTrackName.trim() || trackLoading) return;
    setTrackLoading(true);
    const fd = new FormData();
    fd.append("title", newTrackName.trim());
    if (newTrackDescription.trim()) fd.append("description", newTrackDescription.trim());
    const res = await createGatheringTrackAction(gatheringId, fd);
    if (res.success) {
      const newTrack = res.data?.data ?? res.data ?? {};
      setGathering((prev) =>
        prev ? { ...prev, tracks: [...(prev.tracks || []), newTrack] } : prev
      );
      toast({ type: "success", title: "Track added", message: `"${newTrackName.trim()}" has been created.` });
      setAddTrackFor(false);
      setNewTrackName("");
      setNewTrackDescription("");
    } else {
      toast({ type: "error", title: "Failed", message: res.error || "Could not create track." });
    }
    setTrackLoading(false);
  };

  const handleUpdateTrack = async () => {
    if (!editTrack || !editTrack.title.trim() || editTrackLoading) return;
    setEditTrackLoading(true);
    const fd = new FormData();
    fd.append("title", editTrack.title.trim());
    fd.append("description", editTrack.description.trim());
    const res = await updateGatheringTrackAction(gatheringId, editTrack.id, fd);
    if (res.success) {
      setGathering((prev) =>
        prev
          ? {
              ...prev,
              tracks: (prev.tracks || []).map((t) =>
                t.id === editTrack.id
                  ? { ...t, title: editTrack.title.trim(), name: editTrack.title.trim(), description: editTrack.description.trim() }
                  : t
              ),
            }
          : prev
      );
      toast({ type: "success", title: "Track updated", message: "Track details have been saved." });
      setEditTrack(null);
    } else {
      toast({ type: "error", title: "Update failed", message: res.error || "Could not update track." });
    }
    setEditTrackLoading(false);
  };

  const handleDeleteTrack = async (track: Track) => {
    const trackName = track.name || track.title || "Track";
    const ok = await confirm({
      title: "Delete Track",
      message: `Delete "${trackName}" and all its episodes?`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    const res = await deleteGatheringTrackAction(gatheringId, track.id);
    if (res.success) {
      setGathering((prev) =>
        prev ? { ...prev, tracks: (prev.tracks || []).filter((t) => t.id !== track.id) } : prev
      );
      toast({ type: "success", title: "Track deleted", message: `"${trackName}" has been removed.` });
    } else {
      toast({ type: "error", title: "Delete failed", message: res.error || "Could not delete track." });
    }
  };

  const handleDeleteEpisode = async (trackId: string, episode: Episode) => {
    const ok = await confirm({
      title: "Delete Episode",
      message: `Delete "${episode.title}"? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    const res = await deleteVideoAction(episode.id);
    if (res.success) {
      setGathering((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          tracks: (prev.tracks || []).map((t) =>
            t.id === trackId
              ? {
                  ...t,
                  episodes: (t.episodes || t.videos || []).filter((e) => e.id !== episode.id),
                  videos: (t.videos || t.episodes || []).filter((e) => e.id !== episode.id),
                }
              : t
          ),
        };
      });
      toast({ type: "success", title: "Episode deleted", message: `"${episode.title}" has been removed.` });
    } else {
      toast({ type: "error", title: "Delete failed", message: res.error || "Could not delete episode." });
    }
  };

  const handleEpisodeMoved = (episodeId: string) => {
    setGathering((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tracks: (prev.tracks || []).map((t) =>
          t.id === moveEpisode.trackId
            ? {
                ...t,
                episodes: (t.episodes || t.videos || []).filter((e) => e.id !== episodeId),
                videos: (t.videos || []).filter((e) => e.id !== episodeId),
              }
            : t
        ),
      };
    });
  };

  const handleEpisodeUpdated = (updated: Partial<Episode> & { id: string }) => {
    setGathering((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tracks: (prev.tracks || []).map((t) =>
          t.id === editEpisode.trackId
            ? {
                ...t,
                episodes: (t.episodes || t.videos || []).map((e) =>
                  e.id === updated.id ? { ...e, ...updated } : e
                ),
                videos: (t.videos || []).map((e) =>
                  e.id === updated.id ? { ...e, ...updated } : e
                ),
              }
            : t
        ),
      };
    });
  };

  const tracks = gathering?.tracks || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0d0f14] p-6 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-amber-500" />
      </div>
    );
  }

  if (!gathering) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0d0f14] p-6">
        <button
          onClick={() => router.push("/dashboard/gatherings")}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back to Gatherings
        </button>
        <p className="text-slate-500">Gathering not found.</p>
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
        showSpeakers
      />
      <MoveEpisodeSheet
        episode={moveEpisode.episode}
        currentGatheringId={gatheringId}
        currentTrackId={moveEpisode.trackId}
        open={moveEpisode.open}
        setOpen={(v) => setMoveEpisode((s) => ({ ...s, open: v }))}
        onMoved={handleEpisodeMoved}
      />
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Back */}
        <button
          onClick={() => router.push("/dashboard/gatherings")}
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Gatherings
        </button>

        {/* Gathering header */}
        <div className="bg-white dark:bg-[#111318] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center gap-4 p-6">
            <div className="relative shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-slate-900 border border-slate-100 dark:border-slate-700">
              {gathering.coverPhotoUrl || gathering.thumbnailUrl ? (
                <Image
                  src={gathering.coverPhotoUrl || gathering.thumbnailUrl!}
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
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{gathering.title}</h1>
              {gathering.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{gathering.description}</p>
              )}
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
              </p>
            </div>
            <button
              onClick={() => { setAddTrackFor(true); setNewTrackName(""); setNewTrackDescription(""); }}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-all shrink-0"
            >
              <Plus size={15} /> Add Track
            </button>
          </div>

          {/* Inline add track form */}
          {addTrackFor && (
            <div className="px-6 pb-4 border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
              <input
                autoFocus
                value={newTrackName}
                onChange={(e) => setNewTrackName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") { setAddTrackFor(false); setNewTrackName(""); setNewTrackDescription(""); }
                }}
                disabled={trackLoading}
                placeholder="Track name…"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-60"
              />
              <textarea
                value={newTrackDescription}
                onChange={(e) => setNewTrackDescription(e.target.value)}
                disabled={trackLoading}
                placeholder="Track description (optional)…"
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-1 focus:ring-amber-500 resize-none disabled:opacity-60"
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => { setAddTrackFor(false); setNewTrackName(""); setNewTrackDescription(""); }}
                  disabled={trackLoading}
                  className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTrack}
                  disabled={trackLoading || !newTrackName.trim()}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg disabled:opacity-40 flex items-center gap-1.5"
                >
                  {trackLoading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  {trackLoading ? "Adding…" : "Add Track"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tracks */}
        {tracks.length === 0 ? (
          <div className="bg-white dark:bg-[#111318] rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mx-auto mb-4">
              <Film size={28} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="font-semibold text-slate-900 dark:text-white">No tracks yet</p>
            <p className="text-sm text-slate-500 mt-1">Add a track to start uploading episodes.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tracks.map((track) => {
              const trackName = track.name || track.title || "Untitled Track";
              const episodes: Episode[] = track.episodes || track.videos || [];

              const isCollapsed = collapsedTracks.has(track.id);

              return (
                <div
                  key={track.id}
                  className="bg-white dark:bg-[#111318] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                  {/* Track header */}
                  <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 dark:bg-white/[0.02]" style={{ borderBottom: isCollapsed ? "none" : undefined }} >
                    <button
                      onClick={() => toggleCollapse(track.id)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      <ChevronDown
                        size={16}
                        className={`shrink-0 text-slate-400 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`}
                      />
                      <span className="text-base font-bold text-slate-900 dark:text-white truncate">{trackName}</span>
                      <span className="shrink-0 text-xs font-medium bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                        {episodes.length} {episodes.length === 1 ? "episode" : "episodes"}
                      </span>
                    </button>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/gatherings/${gatheringId}/upload-episode?trackId=${track.id}&trackName=${encodeURIComponent(trackName)}`
                          )
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 rounded-lg transition-all"
                      >
                        <CloudUpload size={13} /> Upload Episode
                      </button>
                      <button
                        onClick={() => setEditTrack({ id: track.id, title: trackName, description: track.description || "" })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-all"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTrack(track)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-500 border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-lg transition-all"
                      >
                        <Trash2 size={13} /> Delete Track
                      </button>
                    </div>
                  </div>

                  {/* Inline track edit form */}
                  {editTrack?.id === track.id && (
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-white/[0.02] space-y-3">
                      <input
                        autoFocus
                        value={editTrack.title}
                        onChange={(e) => setEditTrack((s) => s ? { ...s, title: e.target.value } : s)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleUpdateTrack(); } if (e.key === "Escape") setEditTrack(null); }}
                        disabled={editTrackLoading}
                        placeholder="Track name…"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-60"
                      />
                      <textarea
                        value={editTrack.description}
                        onChange={(e) => setEditTrack((s) => s ? { ...s, description: e.target.value } : s)}
                        disabled={editTrackLoading}
                        placeholder="Track description (optional)…"
                        rows={2}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-1 focus:ring-amber-500 resize-none disabled:opacity-60"
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setEditTrack(null)}
                          disabled={editTrackLoading}
                          className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdateTrack}
                          disabled={editTrackLoading || !editTrack.title.trim()}
                          className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg disabled:opacity-40 flex items-center gap-1.5"
                        >
                          {editTrackLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                          {editTrackLoading ? "Saving…" : "Save"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Episodes */}
                  {!isCollapsed && (episodes.length === 0 ? (
                    <div className="px-6 py-10 text-center border-t border-slate-100 dark:border-slate-800">
                      <Film size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-sm text-slate-400 dark:text-slate-500">No episodes yet. Upload one above.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800">
                      {episodes.map((episode) => {
                        const speakers = episode.speakers?.map((s) => s.name).join(", ") || "";
                        return (
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
                                    ["PUBLISHED", "READY"].includes(episode.status?.toUpperCase())
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
                                {speakers && (
                                  <span className="flex items-center gap-1 text-[11px] text-slate-400 truncate max-w-48">
                                    <Users size={10} /> {speakers}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="shrink-0 flex items-center gap-1">
                              <button
                                onClick={() => setMoveEpisode({ open: true, trackId: track.id, episode })}
                                className="text-slate-300 dark:text-slate-600 hover:text-sky-500 dark:hover:text-sky-400 transition-colors p-1"
                                title="Move to another track"
                              >
                                <ArrowRightLeft size={15} />
                              </button>
                              <button
                                onClick={() => setEditEpisode({ open: true, trackId: track.id, episode })}
                                className="text-slate-300 dark:text-slate-600 hover:text-amber-500 dark:hover:text-amber-400 transition-colors p-1"
                                title="Edit episode"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteEpisode(track.id, episode)}
                                className="text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-1"
                                title="Delete episode"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
