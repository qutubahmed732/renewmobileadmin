"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRightLeft, Loader2, Plus, UserRound, X, ChevronDown, Upload } from "lucide-react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { getGatheringsAction } from "@/app/gatheringActions";
import { updateVideoAction } from "@/app/editaction";
import { useToast } from "@/components/ui/toast";

interface Episode {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  speakers?: { name: string }[];
}

interface Props {
  episode: Episode | null;
  currentGatheringId: string;
  currentTrackId: string;
  open: boolean;
  setOpen: (v: boolean) => void;
  onMoved: (episodeId: string) => void;
}

const AVATAR_COLORS = [
  "bg-amber-500", "bg-sky-500", "bg-emerald-500", "bg-violet-500",
  "bg-rose-500", "bg-orange-500", "bg-teal-500", "bg-indigo-500",
];

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function MoveEpisodeSheet({
  episode,
  currentGatheringId,
  currentTrackId,
  open,
  setOpen,
  onMoved,
}: Props) {
  const { toast } = useToast();
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const [gatherings, setGatherings] = useState<any[]>([]);
  const [fetchingGatherings, setFetchingGatherings] = useState(false);

  const [selectedGatheringId, setSelectedGatheringId] = useState("");
  const [selectedTrackId, setSelectedTrackId] = useState("");

  // editable fields — pre-populated from episode
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // speakers always start empty — user adds intentionally
  const [speakers, setSpeakers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedGatheringId("");
    setSelectedTrackId("");
    setTitle(episode?.title || "");
    setDescription(episode?.description || "");
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setSpeakers([]); // intentionally empty — avoids showing default/auto-set speakers

    setFetchingGatherings(true);
    getGatheringsAction().then((res) => {
      if (res.success) {
        const items = res.data?.data?.items || res.data?.items || res.data?.data || [];
        setGatherings(Array.isArray(items) ? items : []);
      }
      setFetchingGatherings(false);
    });
  }, [open, episode]);

  const selectedGathering = gatherings.find((g) => g.id === selectedGatheringId);
  const availableTracks: any[] = Array.isArray(selectedGathering?.tracks) ? selectedGathering.tracks : [];

  const isSameLocation = selectedGatheringId === currentGatheringId && selectedTrackId === currentTrackId;
  const canMove = selectedGatheringId && selectedTrackId && !isSameLocation;

  const handleMove = async () => {
    if (!canMove || !episode) return;
    setLoading(true);
    try {
      const validSpeakers = speakers.map((s) => s.trim()).filter(Boolean);
      const formData = new FormData();
      formData.append("gatheringTrackId", selectedTrackId);
      if (title.trim()) formData.append("title", title.trim());
      if (description.trim()) formData.append("description", description.trim());
      formData.append("speakerNames", JSON.stringify(validSpeakers));
      if (thumbnailFile) formData.append("thumbnail", thumbnailFile);

      const res = await updateVideoAction(episode.id, formData);
      if (res.success) {
        toast({
          type: "success",
          title: "Episode moved",
          message: `"${title.trim() || episode.title}" has been moved to the selected track.`,
        });
        onMoved(episode.id);
        setOpen(false);
      } else {
        toast({ type: "error", title: "Move failed", message: res.error || "Could not move episode." });
      }
    } catch {
      toast({ type: "error", title: "Error", message: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  const existingThumb = episode?.thumbnailUrl;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="p-0 overflow-y-auto border-l border-slate-200 dark:border-slate-800 max-w-xl!">
        <SheetHeader>
          <VisuallyHidden>
            <SheetTitle>Move Episode</SheetTitle>
            <SheetDescription>Move episode to a different gathering track</SheetDescription>
          </VisuallyHidden>
        </SheetHeader>

        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-white/5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
            <ArrowRightLeft size={20} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Move &amp; Update Episode</h2>
        </div>

        <div className="p-6 space-y-6">

          {/* Destination */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Move to</p>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Gathering</label>
              {fetchingGatherings ? (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-400">
                  <Loader2 size={14} className="animate-spin" /> Loading gatherings…
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedGatheringId}
                    onChange={(e) => { setSelectedGatheringId(e.target.value); setSelectedTrackId(""); }}
                    disabled={loading}
                    className="w-full appearance-none px-4 py-2.5 pr-9 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-amber-500 outline-none transition-all disabled:opacity-60 cursor-pointer"
                  >
                    <option value="">Select a gathering…</option>
                    {gatherings.map((g) => (
                      <option key={g.id} value={g.id}>{g.title}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Track</label>
              <div className="relative">
                <select
                  value={selectedTrackId}
                  onChange={(e) => setSelectedTrackId(e.target.value)}
                  disabled={loading || !selectedGatheringId || availableTracks.length === 0}
                  className="w-full appearance-none px-4 py-2.5 pr-9 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-amber-500 outline-none transition-all disabled:opacity-60 cursor-pointer"
                >
                  <option value="">
                    {!selectedGatheringId
                      ? "Select a gathering first…"
                      : availableTracks.length === 0
                      ? "No tracks in this gathering"
                      : "Select a track…"}
                  </option>
                  {availableTracks.map((t: any) => {
                    const name = t.name || t.title || "Untitled Track";
                    const isCurrent = selectedGatheringId === currentGatheringId && t.id === currentTrackId;
                    return (
                      <option key={t.id} value={t.id}>
                        {name}{isCurrent ? " (current)" : ""}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              {isSameLocation && selectedTrackId && (
                <p className="text-xs text-amber-600 dark:text-amber-400">This is the current track. Please select a different one.</p>
              )}
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Episode details */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Episode Details</p>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                placeholder="Episode title…"
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-amber-500 outline-none transition-all disabled:opacity-60"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={loading}
                placeholder="Episode description…"
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-amber-500 outline-none resize-none transition-all disabled:opacity-60"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Cover Image</label>
              <div
                className={`relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-amber-50/20 dark:bg-amber-500/5 min-h-[110px] flex items-center justify-center cursor-pointer ${loading ? "pointer-events-none opacity-60" : ""}`}
                onClick={() => thumbInputRef.current?.click()}
              >
                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setThumbnailFile(f);
                    setThumbnailPreview(f ? URL.createObjectURL(f) : null);
                  }}
                />
                {thumbnailPreview ? (
                  <div className="relative w-full">
                    <div className="relative w-full h-36">
                      <Image src={thumbnailPreview} alt="New cover" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-sm font-semibold">Click to change</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setThumbnailFile(null); setThumbnailPreview(null); }}
                      className="absolute top-2 right-2 z-10 bg-rose-500 text-white rounded-full p-1 shadow hover:bg-rose-600 transition-colors"
                    >
                      <X size={13} />
                    </button>
                    <p className="text-center text-xs text-slate-400 py-1.5 truncate px-4">{thumbnailFile?.name}</p>
                  </div>
                ) : existingThumb ? (
                  <div className="relative w-full">
                    <div className="relative w-full h-36">
                      <Image src={existingThumb} alt="Current cover" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-sm font-semibold">Click to replace</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Upload className="mx-auto text-amber-500 mb-2" size={20} />
                    <p className="text-xs text-slate-500">Click to upload cover image</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Speakers */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Speakers</p>
              <button
                type="button"
                onClick={() => setSpeakers((prev) => [...prev, ""])}
                disabled={loading}
                className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 disabled:opacity-40 transition-colors"
              >
                <Plus size={13} /> Add Speaker
              </button>
            </div>

            {speakers.length === 0 ? (
              <button
                type="button"
                onClick={() => setSpeakers([""])}
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-all disabled:opacity-40"
              >
                <UserRound size={16} /> Add a speaker
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                {speakers.map((name, idx) => {
                  const trimmed = name.trim();
                  const color = trimmed ? avatarColor(trimmed) : "bg-slate-200 dark:bg-slate-700";
                  return (
                    <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-white/[0.03]">
                      <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${color}`}>
                        {trimmed ? initials(trimmed) : "?"}
                      </div>
                      <input
                        value={name}
                        onChange={(e) => setSpeakers((prev) => prev.map((s, i) => i === idx ? e.target.value : s))}
                        disabled={loading}
                        placeholder="Speaker name…"
                        className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none disabled:opacity-60"
                      />
                      <button
                        type="button"
                        onClick={() => setSpeakers((prev) => prev.filter((_, i) => i !== idx))}
                        disabled={loading}
                        className="shrink-0 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors disabled:opacity-40"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleMove}
              disabled={loading || !canMove}
              className="px-8 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "Saving…" : "Move Episode"}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
