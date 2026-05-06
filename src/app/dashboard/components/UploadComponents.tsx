"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, FileVideo, Layers, Users, Calendar, X } from "lucide-react";
import * as tus from "tus-js-client";
import { createVideoSessionAction, completeVideoUploadAction } from "../../uploadAction";
import { useToast } from "@/components/ui/toast";

interface Props {
  type: "video" | "series" | "small-group" | "gathering";
  onUpload: (token: string, formData: FormData) => Promise<any>;
  onCancel: () => void;
}

export default function UploadForm({ type, onUpload, onCancel }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const config = {
    video: { title: "Video", color: "text-blue-500", bg: "bg-blue-500/10", icon: <FileVideo size={20} />, btn: "Upload" },
    series: { title: "Series", color: "text-purple-500", bg: "bg-purple-500/10", icon: <Layers size={20} />, btn: "Create" },
    "small-group": { title: "Small Group", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: <Users size={20} />, btn: "Create" },
    "gathering": { title: "Gathering", color: "text-amber-500", bg: "bg-amber-500/10", icon: <Calendar size={20} />, btn: "Schedule" },
  };

  const handleCoverChange = (file: File | null) => {
    setCoverFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
    } else {
      setCoverPreview(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setUploadProgress(0);

    const token = localStorage.getItem("authorized token");

    // ── VIDEO (TUS Direct Upload) ──────────────────────────────────────────────
    if (type === "video") {
      if (!mediaFile) {
        toast({ type: "error", title: "Video required", message: "Please select a video file before uploading." });
        setLoading(false);
        return;
      }

      // Phase 1: Create Session
      const sessionData = new FormData(formRef.current!);
      sessionData.append("sourceFileName", mediaFile.name);
      sessionData.append("sourceFileSize", String(mediaFile.size));
      sessionData.append("mimeType", mediaFile.type);
      if (coverFile) sessionData.append("thumbnail", coverFile);

      const sessionRes = await createVideoSessionAction(token!, sessionData);
      const data = sessionRes.data?.data || sessionRes.data;
      const uploadUrl = data?.uploadUrl || data?.upload_link;
      const videoId = data?.id || data?.videoId;

      if (!sessionRes.success || !uploadUrl || !videoId) {
        toast({
          type: "error",
          title: "Session creation failed",
          message: data?.message || "Could not initialize the upload session. Please try again.",
        });
        setLoading(false);
        return;
      }

      // Phase 2: TUS Direct Upload
      const upload = new tus.Upload(mediaFile, {
        uploadUrl: uploadUrl,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        metadata: {
          filename: mediaFile.name,
          filetype: mediaFile.type,
        },
        onError: function (error) {
          console.error("TUS Upload failed:", error);
          toast({ type: "error", title: "Upload failed", message: error.message });
          setLoading(false);
          setUploadProgress(0);
        },
        onProgress: function (bytesUploaded, bytesTotal) {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(0);
          setUploadProgress(Number(percentage));
        },
        onSuccess: async function () {
          // Phase 3: Complete Upload
          setUploadProgress(100);
          const completeRes = await completeVideoUploadAction(token!, videoId);
          if (completeRes.success) {
            toast({ type: "success", title: "Video uploaded!", message: "Your video has been uploaded and is being processed." });
            onCancel();
          } else {
            toast({
              type: "error",
              title: "Finalization failed",
              message: completeRes.data?.message || "Video reached Vimeo but backend failed to finalize. Check logs.",
            });
          }
          setLoading(false);
          setUploadProgress(0);
        },
      });

      upload.start();
      return;
    }

    // ── SERIES & SMALL GROUPS (Standard multipart upload) ─────────────────────
    const formData = new FormData(formRef.current!);

    // Remove any empty file blobs the browser auto-appends
    const cleanFormData = new FormData();
    formData.forEach((value, key) => {
      if (value instanceof File) {
        if (value.size > 0) cleanFormData.append(key, value);
      } else {
        cleanFormData.append(key, value);
      }
    });

    // Thumbnail field — API expects "thumbnail" not "coverImage"
    if (coverFile) cleanFormData.append("thumbnail", coverFile);

    // Small Groups require createdById — pull from stored user info
    if (type === "small-group") {
      const userRaw = localStorage.getItem("user") || localStorage.getItem("userData") || localStorage.getItem("userInfo");
      let userId: string | null = null;
      if (userRaw) {
        try { userId = JSON.parse(userRaw)?.id || JSON.parse(userRaw)?.userId || null; } catch {}
      }
      // fallback: try token payload
      if (!userId) {
        const tokenStr = localStorage.getItem("authorized token");
        if (tokenStr) {
          try {
            const payload = JSON.parse(atob(tokenStr.split(".")[1]));
            userId = payload?.sub || payload?.id || null;
          } catch {}
        }
      }
      if (userId) cleanFormData.append("createdById", userId);
    }

    const res = await onUpload(token!, cleanFormData);
    if (res.success) {
      toast({ type: "success", title: `${config[type].title} created!`, message: "Your content has been created successfully." });
      onCancel();
    } else {
      const errMsg = res.data?.message || res.message || "Something went wrong. Please try again.";
      toast({ type: "error", title: "Creation failed", message: Array.isArray(errMsg) ? errMsg.join(", ") : errMsg });
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-white/5">
        <div className={`p-2 rounded-lg ${config[type].bg} ${config[type].color}`}>
          {config[type].icon}
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {type === "video" ? "Add Video Details" : `Create ${config[type].title}`}
        </h2>
      </div>

      <form ref={formRef} onSubmit={handleUpload} className="p-6 space-y-6">
        {/* Title */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{config[type].title} Title <span className="text-rose-500">*</span></label>
            <input
              name="title"
              required
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
              placeholder={`Enter ${type} title here...`}
            />
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{config[type].title} Description</label>
          <textarea
            name="description"
            rows={4}
            className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-amber-500 outline-none resize-none transition-all"
            placeholder={`Enter ${type} description here...`}
          />
        </div>

        {/* Upload Zones */}
        <div className="grid gap-6">
          {/* Cover Image */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {type === "video" ? "Video Cover Image" : "Thumbnail (Cover Image)"}
            </label>
            <ImageUploadZone
              file={coverFile}
              preview={coverPreview}
              onChange={handleCoverChange}
              label="Click to upload image (max 30MB)"
            />
          </div>

          {/* Video File */}
          {type === "video" && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Video File <span className="text-rose-500">*</span></label>
              <FileUploadZone
                file={mediaFile}
                onChange={setMediaFile}
                label="Click to upload video file"
                accept="video/*"
              />
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          {loading && type === "video" && uploadProgress > 0 && (
            <div className="w-full">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Uploading video directly to Vimeo...</span>
                <span className="font-bold text-amber-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-lg shadow-sm disabled:opacity-60 transition-all flex items-center justify-center min-w-[120px]"
            >
              {loading && type === "video" ? "Uploading..." : loading ? "Processing..." : config[type].btn}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ── Image Upload Zone — shows a preview of the image ──────────────────────────
function ImageUploadZone({ file, preview, onChange, label }: {
  file: File | null;
  preview: string | null;
  onChange: (file: File | null) => void;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-yellow-50/20 dark:bg-yellow-500/5 transition-all min-h-[140px] flex items-center justify-center">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />

      {preview ? (
        <div className="relative w-full">
          <div className="relative w-full h-48">
            <Image src={preview} alt="Cover preview" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <p className="text-white text-sm font-semibold">Click to change image</p>
            </div>
          </div>
          {/* Remove button */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(null); if (inputRef.current) inputRef.current.value = ""; }}
            className="absolute top-2 right-2 z-20 bg-rose-500 text-white rounded-full p-1 shadow-lg hover:bg-rose-600 transition-colors"
          >
            <X size={14} />
          </button>
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-2 truncate px-4">{file?.name}</p>
        </div>
      ) : (
        <div className="text-center py-8">
          <Upload className="mx-auto text-yellow-600 mb-2" size={24} />
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      )}
    </div>
  );
}

// ── Generic File Upload Zone (for video files) ─────────────────────────────────
function FileUploadZone({ file, onChange, label, accept }: {
  file: File | null;
  onChange: (file: File | null) => void;
  label: string;
  accept: string;
}) {
  return (
    <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center bg-yellow-50/20 dark:bg-yellow-500/5 hover:bg-yellow-50/40 transition-all">
      <input
        type="file"
        accept={accept}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
      {file ? (
        <div className="flex flex-col items-center gap-1 text-center">
          <FileVideo size={28} className="text-amber-500 mb-1" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate max-w-xs">{file.name}</span>
          <span className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
        </div>
      ) : (
        <div className="text-center">
          <Upload className="mx-auto text-yellow-600 mb-2" size={24} />
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      )}
    </div>
  );
}