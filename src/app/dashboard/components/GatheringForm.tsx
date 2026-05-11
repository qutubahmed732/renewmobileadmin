"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Plus, UserRound, Loader2 } from "lucide-react";
import { createGatheringAction } from "@/app/gatheringActions";
import { useToast } from "@/components/ui/toast";

interface Keynote {
  id: number;
  name: string;
  photo: File | null;
  preview: string | null;
}

interface Props {
  onCancel: () => void;
}

export default function GatheringForm({ onCancel }: Props) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [keynotes, setKeynotes] = useState<Keynote[]>([{ id: Date.now(), name: "", photo: null, preview: null }]);
  const [loading, setLoading] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);

  const addKeynote = () => {
    setKeynotes((prev) => [...prev, { id: Date.now(), name: "", photo: null, preview: null }]);
  };

  const removeKeynote = (id: number) => {
    if (keynotes.length === 1) return;
    setKeynotes((prev) => prev.filter((k) => k.id !== id));
  };

  const updateKeynoteName = (id: number, value: string) => {
    setKeynotes((prev) => prev.map((k) => k.id === id ? { ...k, name: value } : k));
  };

  const updateKeynotePhoto = (id: number, file: File | null) => {
    setKeynotes((prev) => prev.map((k) =>
      k.id === id ? { ...k, photo: file, preview: file ? URL.createObjectURL(file) : null } : k
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", name.trim());
      if (description.trim()) formData.append("description", description.trim());
      if (coverFile) formData.append("thumbnail", coverFile);

      // Build speakers JSON and collect photos with their indexes
      const filledKeynotes = keynotes.filter((k) => k.name.trim());
      if (filledKeynotes.length > 0) {
        const speakersJson = filledKeynotes.map((k, i) => ({ name: k.name.trim(), sortOrder: i }));
        formData.append("speakers", JSON.stringify(speakersJson));

        const photoIndexes: number[] = [];
        filledKeynotes.forEach((k, i) => {
          if (k.photo) {
            formData.append("speakerPhotos[]", k.photo);
            photoIndexes.push(i);
          }
        });
        if (photoIndexes.length > 0) {
          formData.append("speakerPhotoIndexes", JSON.stringify(photoIndexes));
        }
      }

      const result = await createGatheringAction(formData);

      if (result.success) {
        toast({ type: "success", title: "Gathering created!", message: "Your gathering has been created successfully." });
        onCancel();
      } else {
        const msg = Array.isArray(result.data?.message)
          ? result.data.message.join(", ")
          : result.data?.message || result.message || "Something went wrong.";
        toast({ type: "error", title: "Creation failed", message: String(msg) });
      }
    } catch {
      toast({ type: "error", title: "Error", message: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-white/5">
        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
          <UserRound size={20} />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create Gathering</h2>
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
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Gathering Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            disabled={loading}
            placeholder="Enter gathering description…"
            className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-amber-500 outline-none resize-none transition-all disabled:opacity-60"
          />
        </div>

        {/* Cover Photo */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Gathering Cover Photo
          </label>
          <div
            className={`relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-yellow-50/20 dark:bg-yellow-500/5 min-h-[160px] flex items-center justify-center cursor-pointer ${loading ? "pointer-events-none opacity-60" : ""}`}
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
                <div className="relative w-full h-52">
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
            ) : (
              <div className="text-center py-8">
                <Upload className="mx-auto text-amber-500 mb-2" size={24} />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Click to upload cover photo</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 30 MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Keynotes / Speakers */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Speakers</label>
              <p className="text-xs text-slate-400 mt-0.5">Add one or more speakers for this gathering.</p>
            </div>
            <button
              type="button"
              onClick={addKeynote}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/30 bg-amber-500/8 hover:bg-amber-500/15 rounded-lg transition-colors disabled:opacity-50"
            >
              <Plus size={14} strokeWidth={2.5} />
              Add Speaker
            </button>
          </div>

          <div className="space-y-3">
            {keynotes.map((keynote, index) => (
              <div
                key={keynote.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40"
              >
                <span className="text-xs font-bold text-slate-400 dark:text-slate-600 w-4 shrink-0">
                  {index + 1}
                </span>

                {/* Photo upload */}
                <label className={`relative shrink-0 cursor-pointer group ${loading ? "pointer-events-none" : ""}`}>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => updateKeynotePhoto(keynote.id, e.target.files?.[0] || null)}
                  />
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center transition-colors group-hover:border-amber-400 relative">
                    {keynote.preview ? (
                      <Image src={keynote.preview} alt="Speaker" fill className="object-cover rounded-full" />
                    ) : (
                      <Upload size={16} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow">
                    <Plus size={10} strokeWidth={3} className="text-white" />
                  </div>
                </label>

                <input
                  type="text"
                  value={keynote.name}
                  onChange={(e) => updateKeynoteName(keynote.id, e.target.value)}
                  disabled={loading}
                  placeholder="Speaker name…"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-amber-500 outline-none transition-all disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => removeKeynote(keynote.id)}
                  disabled={keynotes.length === 1 || loading}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
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
            {loading ? "Creating…" : "Create Gathering"}
          </button>
        </div>
      </form>
    </div>
  );
}
