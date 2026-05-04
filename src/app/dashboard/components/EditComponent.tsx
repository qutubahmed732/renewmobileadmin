"use client"

import React, { useState, useEffect, useActionState } from 'react'
import Image from 'next/image'
import { ArrowLeft, Video, Layers, Users, Upload, Package, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { updateSeriesAction, updateSmallGroupAction, updateVideoAction } from '@/app/editaction'

type ContentType = 'videos' | 'series' | 'small-group';

export default function EditContentForm() {
  const [data, setData] = useState<any>(null);
  const [type, setType] = useState<ContentType>('videos');
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [token, setToken] = useState("")

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile); // ✅ important
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
    console.log(selectedFile);
  };

  // localStorage se data load karna
  useEffect(() => {
    const savedData = localStorage.getItem("editData");
    const savedType = localStorage.getItem("editType") as ContentType;

    if (savedData) {
      const parsed = JSON.parse(savedData);
      setData(parsed);
      setTitle(parsed.title || "");
      setDescription(parsed.description || "");
      setToken(localStorage.getItem("authorized token") as string)
    }
    if (savedType) setType(savedType);
    setIsLoaded(true);
  }, []);


  console.log(data)
  console.log(token)

  const updateActionWithArgs = data
    ? type === 'videos'
      ? updateVideoAction.bind(null, data.id)
      : type === 'series'
        ? updateSeriesAction.bind(null, data.id)
        : updateSmallGroupAction.bind(null, data.id)
    : null;

  const [state, formAction, isPending]: any = useActionState(
    async (prevState: any, formData: FormData) => {
      if (!updateActionWithArgs) return { error: "Data not loaded" };
      return await updateActionWithArgs(formData, token as string);
    },
    null
  );

  // Success aur Error handling logic
  useEffect(() => {
    if (state?.success) {
      console.log("✅ Success:", state.message || "Updated successfully");
      setShowSuccess(true);
      // 3 second baad success message hatane ke liye
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    } else if (state?.error) {
      console.error("❌ Error:", state.error);
    }
  }, [state]);

  const ui = {
    videos: { title: "Edit Video", titleLabel: "Video Title", descLabel: "Video Description", coverLabel: "Video Cover Image", icon: <Video size={20} className="text-amber-500" /> },
    series: { title: "Edit Series Details", titleLabel: "Series Title", descLabel: "Series Description", coverLabel: "Thumbnail", icon: <Layers size={20} className="text-amber-500" /> },
    'small-group': { title: "Edit Small Group Details", titleLabel: "Small Group Title", descLabel: "Small Group Description", coverLabel: "Thumbnail", icon: <Users size={20} className="text-amber-500" /> }
  }[type];

  if (!isLoaded) return <div className="min-h-screen bg-white dark:bg-[#0a0b0e] flex items-center justify-center text-amber-500">Loading...</div>;
  if (!data) return <div className="min-h-screen bg-white dark:bg-[#0a0b0e] flex items-center justify-center">No data found.</div>;

  return (
    <form action={formAction} className="min-h-screen bg-white dark:bg-[#0a0b0e] p-4 md:p-10 text-slate-900 dark:text-slate-200">

      {/* Floating Notifications */}
      <div className="fixed top-5 right-5 z-50 space-y-3 max-w-sm w-full transition-all">
        {showSuccess && (
          <div className="flex items-center gap-3 bg-emerald-500 text-white p-4 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 size={24} />
            <div>
              <p className="font-bold">Updated Success!</p>
              <p className="text-xs opacity-90">Your changes have been saved.</p>
            </div>
          </div>
        )}

        {state?.error && (
          <div className="flex items-center gap-3 bg-rose-500 text-white p-4 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
            <AlertCircle size={24} />
            <div>
              <p className="font-bold">Update Failed</p>
              <p className="text-xs opacity-90">{state.error}</p>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/${type}`}>
              <Button type="button" variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              {ui?.icon}
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">{ui?.title}</h1>
            </div>
          </div>

          {type === 'videos' && (
            <div className="hidden md:flex gap-3">
              <Button type="submit" disabled={isPending} className="bg-amber-500 hover:bg-amber-600 text-white font-bold h-10 px-8 rounded-xl shadow-lg disabled:opacity-70">
                {isPending ? "Updating..." : "Update"}
              </Button>
            </div>
          )}
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-[#111318] p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-1">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-400 ml-1">{ui?.titleLabel}</label>
              <input name="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-50 dark:bg-[#1a1d24] border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-500/20" />
            </div>

            {type === 'videos' && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-400 ml-1">Series</label>
                <select name="seriesId" className="w-full bg-slate-50 dark:bg-[#1a1d24] border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 outline-none">
                  <option value={data?.series?.id}>{data?.series?.title || "Select Series"}</option>
                </select>
              </div>
            )}

            {type === 'videos' && (
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-400 ml-1">Vimeo Video URL</label>
                <input name="vimeoVideoUrl" type="text" defaultValue={data?.vimeoVideoUrl || ""} className="w-full bg-slate-50 dark:bg-[#1a1d24] border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 outline-none" />
              </div>
            )}

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-400 ml-1">{ui?.descLabel}</label>
              <textarea name="description" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-50 dark:bg-[#1a1d24] border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 outline-none resize-none" />
            </div>
          </div>

          {/* Thumbnail Section */}
          <div className="space-y-3 pt-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-400 ml-1">{ui?.coverLabel}</label>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex flex-col items-center gap-4">

                {/* Preview Image Logic */}
                {(previewUrl || data?.thumbnailUrl) && (
                  <div className="relative aspect-video w-full max-w-lg rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                    <Image src={previewUrl || data.thumbnailUrl} alt="Preview" fill className="object-cover" />
                  </div>
                )}

                <div className="w-full max-w-lg flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-[#1a1d24]">
                  {/* Hidden Input for File */}
                  <input
                    type="file"
                    name="thumbnail"
                    id="thumbnail-input"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-none h-10 px-4 text-xs font-bold shrink-0"
                    onClick={() => document.getElementById('thumbnail-input')?.click()}
                  >
                    Choose File
                  </Button>
                  <span className="px-4 text-sm text-slate-400 truncate">
                    {previewUrl ? "New image selected" : "No file chosen"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-end gap-3 py-10">
          <Link href={`/dashboard/${type}`}>
            <Button type="button" variant="outline" className="border-slate-200 dark:border-slate-800 rounded-xl px-6 h-10">Cancel</Button>
          </Link>
          {(type === 'series' || type === 'small-group') && (
            <>
              <Button type="button" variant="outline" className="border-slate-200 dark:border-slate-800 rounded-xl px-5 h-10 gap-2"><Upload size={15} /> {type === 'series' ? 'Upload Episode' : 'Upload Video'}</Button>
              <Button type="button" variant="outline" className="border-slate-200 dark:border-slate-800 rounded-xl px-5 h-10 gap-2"><Package size={15} /> Batch Upload</Button>
            </>
          )}
          <Button type="submit" disabled={isPending} className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-10 h-10 rounded-xl transition-all">
            {isPending ? "Updating..." : "Update"}
          </Button>
        </div>
      </div>
    </form>
  )
}