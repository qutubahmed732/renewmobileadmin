"use client";

import { useState, useRef } from "react";
import { Upload, FileVideo, Layers, Users, CheckCircle, Calendar } from "lucide-react";
import * as tus from "tus-js-client";
import { createVideoSessionAction, completeVideoUploadAction } from "../../uploadAction";

interface Props {
  type: "video" | "series" | "small-group" | "gathering";
  onUpload: (token: string, formData: FormData) => Promise<any>;
  onCancel: () => void; // New prop for back button logic
}

export default function UploadForm({ type, onUpload, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [uploadProgress, setUploadProgress] = useState(0);

  const config = {
    video: { title: "Video", color: "text-blue-500", bg: "bg-blue-500/10", icon: <FileVideo size={20} />, btn: "Upload" },
    series: { title: "Series", color: "text-purple-500", bg: "bg-purple-500/10", icon: <Layers size={20} />, btn: "Create" },
    "small-group": { title: "Small Group", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: <Users size={20} />, btn: "Create" },
    "gathering": { title: "Gathering", color: "text-amber-500", bg: "bg-amber-500/10", icon: <Calendar size={20} />, btn: "Schedule" },
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setUploadProgress(0);

    const token = localStorage.getItem("authorized token");
    
    // --- VIDEO UPLOAD (TUS Direct) ---
    if (type === "video") {
      if (!mediaFile) {
        alert("Please select a video file!");
        setLoading(false);
        return;
      }

      // Phase 1: Create Session
      const sessionData = new FormData(formRef.current!);
      sessionData.append("sourceFileName", mediaFile.name);
      sessionData.append("sourceFileSize", String(mediaFile.size));
      if (coverFile) sessionData.append("thumbnail", coverFile);

      const sessionRes = await createVideoSessionAction(token!, sessionData);
      const data = sessionRes.data?.data || sessionRes.data;
      
      const uploadUrl = data?.uploadUrl || data?.upload_link;
      const videoId = data?.id || data?.videoId;

      if (!sessionRes.success || !uploadUrl || !videoId) {
        console.error("Session Error:", sessionRes);
        alert("Failed to initialize video upload session. Please check console.");
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
          alert("Video upload failed: " + error.message);
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
            alert("Video uploaded and processed successfully!");
            onCancel();
          } else {
            console.error("Complete Error:", completeRes);
            alert("Video uploaded to Vimeo but backend failed to finalize. Check console.");
          }
          setLoading(false);
          setUploadProgress(0);
        },
      });

      upload.start();
      return; // Exit here, let TUS onSuccess handle the rest
    }

    // --- STANDARD UPLOAD (Series & Small Groups) ---
    const formData = new FormData(formRef.current!);
    if (coverFile) formData.append("coverImage", coverFile);
    if (mediaFile) formData.append("videoFile", mediaFile);

    const res = await onUpload(token!, formData);
    if (res.success) {
      alert(`${type} processed successfully!`);
      onCancel();
    } else {
      alert("Error: " + res.message);
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
        {/* Title & Type Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{config[type].title} Title</label>
            <input
              name="title"
              required
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
              placeholder={`Enter ${type} title here...`}
            />
          </div>

          {/* {type === "video" && (
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select Content Type</label>
              <select name="contentType" className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none">
                <option value="sermon">Sermon</option>
                <option value="event">Event</option>
              </select>
            </div>
          )} */}
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
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {type === "video" ? "Video Cover Image" : "Thumbnail (Cover Image)"}
            </label>
            <UploadZone 
              file={coverFile} 
              setFile={setCoverFile} 
              label="Click to upload image (max 30MB)"
              accept="image/*"
            />
          </div>

          {type === "video" && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Video Upload</label>
              <UploadZone 
                file={mediaFile} 
                setFile={setMediaFile} 
                label="Click to upload video file" 
                accept="video/*"
              />
            </div>
          )}
        </div>

        {/* Footer with Progress Bar */}
        <div className="flex flex-col gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          
          {loading && type === "video" && uploadProgress > 0 && (
            <div className="w-full">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Uploading Video directly to Vimeo...</span>
                <span className="font-bold text-amber-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-amber-500 h-2.5 rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-lg shadow-sm disabled:opacity-50 transition-all flex items-center justify-center min-w-[120px]"
            >
              {loading && type === "video" ? "Uploading..." : loading ? "Processing..." : config[type].btn}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function UploadZone({ file, setFile, label, accept }: any) {
  return (
    <div className="relative group border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center bg-yellow-50/20 dark:bg-yellow-500/5 hover:bg-yellow-50/40 transition-all">
      <input 
        type="file" 
        accept={accept}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      {file ? (
        <div className="flex items-center gap-2 text-emerald-600 font-medium">
          <CheckCircle size={20} />
          <span className="truncate max-w-xs">{file.name}</span>
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