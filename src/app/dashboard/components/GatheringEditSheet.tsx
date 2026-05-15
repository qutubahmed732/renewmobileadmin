"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Upload, X, UserRound, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { updateGatheringAction } from "@/app/gatheringActions";
import { useToast } from "@/components/ui/toast";

interface Gathering {
  id: string;
  title: string;
  description?: string;
  coverPhotoUrl?: string;
  thumbnailUrl?: string;
  year?: number;
  location?: string;
  eventDetails?: string;
}

interface Props {
  gathering: Gathering | null;
  open: boolean;
  setOpen: (v: boolean) => void;
  onUpdated: (updated: Gathering) => void;
}

export default function GatheringEditSheet({ gathering, open, setOpen, onUpdated }: Props) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  const [location, setLocation] = useState("");
  const [eventDetails, setEventDetails] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!gathering) return;
    setName(gathering.title || "");
    setDescription(gathering.description || "");
    setCoverFile(null);
    setCoverPreview(null);
    setYear(String(gathering.year || ""));
    setLocation(gathering.location || "");
    setEventDetails(gathering.eventDetails || "");
  }, [gathering]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !gathering) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", name.trim());
      if (description.trim()) formData.append("description", description.trim());
      if (coverFile) formData.append("thumbnail", coverFile);
      if (year.trim()) formData.append("year", year.trim());
      if (location.trim()) formData.append("location", location.trim());
      if (eventDetails.trim()) formData.append("eventDetails", eventDetails.trim());

      const result = await updateGatheringAction(gathering.id, formData);

      if (result.success) {
        toast({ type: "success", title: "Gathering updated!", message: "Changes saved successfully." });
        const updated = result.data?.data ?? result.data ?? {};
        onUpdated({ ...gathering, ...updated, title: name.trim(), description: description.trim() });
        setOpen(false);
      } else {
        const msg = Array.isArray(result.data?.message)
          ? result.data.message.join(", ")
          : result.data?.message || result.message || "Something went wrong.";
        toast({ type: "error", title: "Update failed", message: String(msg) });
      }
    } catch {
      toast({ type: "error", title: "Error", message: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  const existingCover = gathering?.coverPhotoUrl || gathering?.thumbnailUrl;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="p-0 overflow-y-auto border-l border-slate-200 dark:border-slate-800 max-w-xl!">
        <SheetHeader>
          <VisuallyHidden>
            <SheetTitle>Edit Gathering</SheetTitle>
            <SheetDescription>Edit gathering details</SheetDescription>
          </VisuallyHidden>
        </SheetHeader>

        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-white/5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
            <UserRound size={20} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Gathering</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Gathering Name <span className="text-rose-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter gathering name…"
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-amber-500 outline-none transition-all disabled:opacity-60"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={loading}
              placeholder="Enter gathering description…"
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-amber-500 outline-none resize-none transition-all disabled:opacity-60"
            />
          </div>

          {/* Year */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              disabled={loading}
              placeholder="e.g. 2026"
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-amber-500 outline-none transition-all disabled:opacity-60"
            />
          </div>

          {/* Location */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
              placeholder="e.g. Indianapolis, IN"
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-amber-500 outline-none transition-all disabled:opacity-60"
            />
          </div>

          {/* Event Details */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Event Details</label>
            <textarea
              value={eventDetails}
              onChange={(e) => setEventDetails(e.target.value)}
              rows={4}
              disabled={loading}
              placeholder="Dates, venue, overview…"
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-amber-500 outline-none resize-none transition-all disabled:opacity-60"
            />
          </div>

          {/* Cover Photo */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cover Photo</label>
            <div
              className={`relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-yellow-50/20 dark:bg-yellow-500/5 min-h-[140px] flex items-center justify-center cursor-pointer ${loading ? "pointer-events-none opacity-60" : ""}`}
              onClick={() => coverInputRef.current?.click()}
            >
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setCoverFile(f);
                  setCoverPreview(f ? URL.createObjectURL(f) : null);
                }}
              />
              {coverPreview ? (
                <div className="relative w-full">
                  <div className="relative w-full h-44">
                    <Image src={coverPreview} alt="Cover preview" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-sm font-semibold">Click to change</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setCoverFile(null); setCoverPreview(null); }}
                    className="absolute top-2 right-2 z-10 bg-rose-500 text-white rounded-full p-1 shadow hover:bg-rose-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                  <p className="text-center text-xs text-slate-400 py-2 truncate px-4">{coverFile?.name}</p>
                </div>
              ) : existingCover ? (
                <div className="relative w-full">
                  <div className="relative w-full h-44">
                    <Image src={existingCover} alt="Current cover" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-sm font-semibold">Click to replace</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Upload className="mx-auto text-amber-500 mb-2" size={24} />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Click to upload cover photo</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 30 MB</p>
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
