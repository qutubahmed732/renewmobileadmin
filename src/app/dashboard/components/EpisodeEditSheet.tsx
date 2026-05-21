"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Upload, X, Film, Loader2, Plus, UserRound } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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
  open: boolean;
  setOpen: (v: boolean) => void;
  onUpdated: (updated: Partial<Episode> & { id: string }) => void;
  showSpeakers?: boolean;
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
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function EpisodeEditSheet({ episode, open, setOpen, onUpdated, showSpeakers = false }: Props) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [speakers, setSpeakers] = useState<string[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const thumbInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!episode) return;
    setTitle(episode.title || "");
    setDescription(episode.description || "");
    setSpeakers((episode.speakers || []).map((s) => s.name));
    setThumbnailFile(null);
    setThumbnailPreview(null);
  }, [episode]);

  const addSpeaker = () => setSpeakers((prev) => [...prev, ""]);
  const updateSpeaker = (idx: number, value: string) =>
    setSpeakers((prev) => prev.map((s, i) => (i === idx ? value : s)));
  const removeSpeaker = (idx: number) =>
    setSpeakers((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading || !episode) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      if (description.trim()) formData.append("description", description.trim());
      if (showSpeakers) {
        const validSpeakers = speakers.map((s) => s.trim()).filter(Boolean);
        formData.append("speakerNames", JSON.stringify(validSpeakers));
      }
      if (thumbnailFile) formData.append("thumbnail", thumbnailFile);

      const result = await updateVideoAction(episode.id, formData);

      if (result.success) {
        toast({ type: "success", title: "Episode updated", message: "Changes saved successfully." });
        const updated = result.data?.data ?? result.data ?? {};
        onUpdated({
          id: episode.id,
          title: title.trim(),
          description: description.trim(),
          ...(showSpeakers && { speakers: speakers.map((s) => s.trim()).filter(Boolean).map((name) => ({ name })) }),
          ...updated,
        });
        setOpen(false);
      } else {
        toast({ type: "error", title: "Update failed", message: result.error || "Something went wrong." });
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
            <SheetTitle>Edit Episode</SheetTitle>
            <SheetDescription>Edit episode details</SheetDescription>
          </VisuallyHidden>
        </SheetHeader>

        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-white/5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
            <Film size={20} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Episode</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Title */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
              placeholder="Episode title…"
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-amber-500 outline-none transition-all disabled:opacity-60"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={loading}
              placeholder="Episode description…"
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-amber-500 outline-none resize-none transition-all disabled:opacity-60"
            />
          </div>

          {/* Speakers — gatherings only */}
          {showSpeakers && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Speakers</label>
                <div className="flex items-center gap-3">
                  {speakers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSpeakers([])}
                      disabled={loading}
                      className="text-xs text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 disabled:opacity-40 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={addSpeaker}
                    disabled={loading}
                    className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 disabled:opacity-40 transition-colors"
                  >
                    <Plus size={13} /> Add Speaker
                  </button>
                </div>
              </div>

              {speakers.length === 0 ? (
                <button
                  type="button"
                  onClick={addSpeaker}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-all disabled:opacity-40"
                >
                  <UserRound size={16} />
                  Add a speaker
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  {speakers.map((name, idx) => {
                    const trimmed = name.trim();
                    const color = trimmed ? avatarColor(trimmed) : "bg-slate-200 dark:bg-slate-700";
                    const initText = trimmed ? initials(trimmed) : "?";
                    return (
                      <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-white/[0.03]">
                        <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${color}`}>
                          {initText}
                        </div>
                        <input
                          value={name}
                          onChange={(e) => updateSpeaker(idx, e.target.value)}
                          disabled={loading}
                          placeholder="Speaker name…"
                          className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none disabled:opacity-60"
                        />
                        <button
                          type="button"
                          onClick={() => removeSpeaker(idx)}
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
          )}

          {/* Thumbnail */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Thumbnail</label>
            <div
              className={`relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-amber-50/20 dark:bg-amber-500/5 min-h-[120px] flex items-center justify-center cursor-pointer ${loading ? "pointer-events-none opacity-60" : ""}`}
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
                  <div className="relative w-full h-40">
                    <Image src={thumbnailPreview} alt="New thumbnail" fill className="object-cover" />
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
                  <div className="relative w-full h-40">
                    <Image src={existingThumb} alt="Current thumbnail" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-sm font-semibold">Click to replace</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Upload className="mx-auto text-amber-500 mb-2" size={22} />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Click to upload thumbnail</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
