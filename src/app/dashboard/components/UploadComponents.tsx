"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, FileVideo, Layers, Users, Calendar, X, CheckCircle2, Loader2 } from "lucide-react";
import * as tus from "tus-js-client";
import {
  createVideoSessionAction,
  completeVideoUploadAction,
  cancelVideoUploadAction,
  getVideoUploadStatusAction,
} from "../../uploadAction";
import { useToast } from "@/components/ui/toast";

interface Props {
  type: "video" | "series" | "small-group" | "gathering";
  onUpload: (token: string, formData: FormData) => Promise<any>;
  onCancel: () => void;
}

// Phase labels for the 3-step video upload flow
type UploadPhase =
  | "idle"
  | "creating-session"   // Phase 1: hitting backend to get Vimeo TUS URL
  | "uploading"          // Phase 2: TUS direct-to-Vimeo
  | "finalizing"         // Phase 3: telling backend to mark video complete
  | "done"
  | "error";

const PHASE_LABELS: Record<UploadPhase, string> = {
  idle: "",
  "creating-session": "Creating upload session…",
  uploading: "Uploading to Vimeo…",
  finalizing: "Finalizing upload…",
  done: "Done!",
  error: "Upload failed",
};

export default function UploadForm({ type, onUpload, onCancel }: Props) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  // Shared state
  const [loading, setLoading] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  // Video-upload-specific state
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [uploadProgress, setUploadProgress] = useState(0); // 0-100
  const [videoIdRef] = useState<{ current: string | null }>({ current: null });
  const tusUploadRef = useRef<tus.Upload | null>(null);

  const config = {
    video: { title: "Video", color: "text-blue-500", bg: "bg-blue-500/10", icon: <FileVideo size={20} />, btn: "Upload" },
    series: { title: "Series", color: "text-purple-500", bg: "bg-purple-500/10", icon: <Layers size={20} />, btn: "Create" },
    "small-group": { title: "Small Group", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: <Users size={20} />, btn: "Create" },
    gathering: { title: "Gathering", color: "text-amber-500", bg: "bg-amber-500/10", icon: <Calendar size={20} />, btn: "Schedule" },
  };

  const handleCoverChange = (file: File | null) => {
    setCoverFile(file);
    setCoverPreview(file ? URL.createObjectURL(file) : null);
  };

  // ── Cancel mid-upload ──────────────────────────────────────────────────────
  const handleCancelUpload = useCallback(async () => {
    // Abort the TUS transfer first
    if (tusUploadRef.current) {
      try { tusUploadRef.current.abort(); } catch {}
      tusUploadRef.current = null;
    }
    // Tell the backend to cancel (cleans up Vimeo & DB record)
    const token = localStorage.getItem("authorized token");
    if (videoIdRef.current && token) {
      try {
        await cancelVideoUploadAction(token, videoIdRef.current);
      } catch {}
    }
    setLoading(false);
    setPhase("idle");
    setUploadProgress(0);
    videoIdRef.current = null;
    onCancel();
  }, [onCancel, videoIdRef]);

  // ── Main submit handler ────────────────────────────────────────────────────
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setUploadProgress(0);
    setPhase("idle");

    const token = localStorage.getItem("authorized token");

    // ── VIDEO (3-phase TUS) ────────────────────────────────────────────────
    if (type === "video") {
      if (!mediaFile) {
        toast({ type: "error", title: "Video required", message: "Please select a video file before uploading." });
        setLoading(false);
        return;
      }

      // ── Phase 1: Create Session ──────────────────────────────────────────
      setPhase("creating-session");

      const sessionData = new FormData(formRef.current!);
      sessionData.append("sourceFileName", mediaFile.name);
      sessionData.append("sourceFileSize", String(mediaFile.size));
      // Swagger field is "sourceMimeType" (not "mimeType")
      if (mediaFile.type) sessionData.append("sourceMimeType", mediaFile.type);
      // Remove any stray empty file blob from the form's hidden file inputs
      sessionData.delete("thumbnail"); // Remove if already appended by browser
      if (coverFile && coverFile.size > 0) sessionData.append("thumbnail", coverFile);

      console.log("[Upload] Phase 1 — creating session...");
      const sessionRes = await createVideoSessionAction(token!, sessionData);

      if (!sessionRes.success) {
        const msg =
          sessionRes.data?.message ||
          (Array.isArray(sessionRes.data?.message) ? sessionRes.data.message.join(", ") : null) ||
          sessionRes.error ||
          "Could not initialize the upload session.";
        console.error("[Upload] Session failed:", sessionRes);
        toast({ type: "error", title: "Session creation failed", message: String(msg) });
        setLoading(false);
        setPhase("error");
        return;
      }

      // Unwrap nested data (backend may return { data: { id, uploadUrl } })
      const sessionPayload = sessionRes.data?.data ?? sessionRes.data;
      const uploadUrl: string | undefined =
        sessionPayload?.uploadUrl ||
        sessionPayload?.upload_link ||
        sessionPayload?.tusUploadUrl;
      const videoId: string | undefined =
        sessionPayload?.id ||
        sessionPayload?.videoId;

      if (!uploadUrl || !videoId) {
        console.error("[Upload] Session response missing uploadUrl or id:", sessionPayload);
        toast({
          type: "error",
          title: "Session response invalid",
          message: `Backend did not return an upload URL or video ID. Got: ${JSON.stringify(sessionPayload)}`,
        });
        setLoading(false);
        setPhase("error");
        return;
      }

      videoIdRef.current = videoId;
      console.log("[Upload] Phase 1 done — videoId:", videoId, "uploadUrl:", uploadUrl);

      // ── Phase 2: TUS Direct Upload ───────────────────────────────────────
      setPhase("uploading");

      const tusUpload = new tus.Upload(mediaFile, {
        uploadUrl,
        // Don't use endpoint — we already have the URL
        retryDelays: [0, 1000, 3000, 5000, 10000, 20000],
        chunkSize: 8 * 1024 * 1024, // 8 MB chunks
        metadata: {
          filename: mediaFile.name,
          filetype: mediaFile.type,
        },
        onError(error) {
          console.error("[Upload] TUS error:", error);
          toast({ type: "error", title: "Upload failed", message: error.message || "Network error during upload." });
          setLoading(false);
          setPhase("error");
          setUploadProgress(0);
        },
        onProgress(bytesUploaded, bytesTotal) {
          const pct = bytesTotal > 0 ? Math.round((bytesUploaded / bytesTotal) * 100) : 0;
          setUploadProgress(pct);
        },
        async onSuccess() {
          console.log("[Upload] Phase 2 done — TUS complete, finalizing...");
          setUploadProgress(100);
          setPhase("finalizing");

          // ── Phase 3: Complete Upload ───────────────────────────────────
          const completeRes = await completeVideoUploadAction(token!, videoId);

          if (completeRes.success) {
            setPhase("done");
            toast({
              type: "success",
              title: "Video uploaded!",
              message: "Your video is now being processed by Vimeo. It will appear shortly.",
            });
            setLoading(false);
            videoIdRef.current = null;
            tusUploadRef.current = null;
            onCancel();
          } else {
            // Poll upload-status as a fallback — backend sometimes returns non-200 even on success
            console.warn("[Upload] completeUpload non-success, polling status...", completeRes);

            const statusRes = await getVideoUploadStatusAction(token!, videoId);
            const statusPayload = statusRes.data?.data ?? statusRes.data;
            const status: string = statusPayload?.status || "";

            if (["PROCESSING", "READY", "PUBLISHED"].includes(status.toUpperCase())) {
              // Backend already finished — treat as success
              setPhase("done");
              toast({
                type: "success",
                title: "Video uploaded!",
                message: "Your video is being processed. It will appear in the list shortly.",
              });
              setLoading(false);
              videoIdRef.current = null;
              tusUploadRef.current = null;
              onCancel();
            } else {
              const errMsg =
                completeRes.data?.message ||
                completeRes.error ||
                "Video reached Vimeo but backend failed to finalize.";
              console.error("[Upload] Finalization failed:", completeRes, "Status poll:", statusRes);
              toast({ type: "error", title: "Finalization failed", message: String(errMsg) });
              setPhase("error");
              setLoading(false);
            }
          }
        },
      });

      tusUploadRef.current = tusUpload;
      tusUpload.start();
      return; // Let TUS callbacks handle the rest
    }

    // ── SERIES & SMALL GROUPS (Standard multipart) ─────────────────────────
    const rawFormData = new FormData(formRef.current!);
    const cleanFormData = new FormData();

    rawFormData.forEach((value, key) => {
      if (value instanceof File) {
        if (value.size > 0) cleanFormData.append(key, value);
      } else {
        cleanFormData.append(key, value);
      }
    });

    if (coverFile && coverFile.size > 0) cleanFormData.append("thumbnail", coverFile);

    if (type === "small-group") {
      const userRaw =
        localStorage.getItem("user") ||
        localStorage.getItem("userData") ||
        localStorage.getItem("userInfo");
      let userId: string | null = null;
      if (userRaw) {
        try {
          const parsed = JSON.parse(userRaw);
          userId = parsed?.id || parsed?.userId || null;
        } catch {}
      }
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
      toast({
        type: "success",
        title: `${config[type].title} created!`,
        message: "Your content has been created successfully.",
      });
      onCancel();
    } else {
      const errMsg =
        res.data?.message ||
        res.message ||
        "Something went wrong. Please try again.";
      toast({
        type: "error",
        title: "Creation failed",
        message: Array.isArray(errMsg) ? errMsg.join(", ") : String(errMsg),
      });
    }
    setLoading(false);
  };

  // ── UI Progress state ──────────────────────────────────────────────────────
  const isVideoUploading = type === "video" && loading;
  const phaseStep = { "creating-session": 1, uploading: 2, finalizing: 3, done: 3, error: 0, idle: 0 }[phase] ?? 0;

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
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {config[type].title} Title <span className="text-rose-500">*</span>
            </label>
            <input
              name="title"
              required
              disabled={loading}
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-amber-500 outline-none transition-all disabled:opacity-60"
              placeholder={`Enter ${type} title here…`}
            />
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {config[type].title} Description
          </label>
          <textarea
            name="description"
            rows={4}
            disabled={loading}
            className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-amber-500 outline-none resize-none transition-all disabled:opacity-60"
            placeholder={`Enter ${type} description here…`}
          />
        </div>

        {/* Upload Zones */}
        <div className="grid gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {type === "video" ? "Video Cover Image" : "Thumbnail (Cover Image)"}
            </label>
            <ImageUploadZone
              file={coverFile}
              preview={coverPreview}
              onChange={handleCoverChange}
              label="Click to upload image (max 30 MB)"
              disabled={loading}
            />
          </div>

          {type === "video" && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Video File <span className="text-rose-500">*</span>
              </label>
              <FileUploadZone
                file={mediaFile}
                onChange={setMediaFile}
                label="Click to select video file (any size supported)"
                accept="video/*"
                disabled={loading}
              />
            </div>
          )}
        </div>

        {/* ── Video Upload Progress ──────────────────────────────────────────── */}
        {isVideoUploading && phase !== "idle" && (
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-4 space-y-3">

            {/* Step indicators */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {(["creating-session", "uploading", "finalizing"] as UploadPhase[]).map((p, idx) => {
                const step = idx + 1;
                const done = phaseStep > step;
                const active = phaseStep === step;
                return (
                  <div key={p} className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                      done ? "bg-emerald-500 text-white" :
                      active ? "bg-amber-500 text-white" :
                      "bg-slate-200 dark:bg-slate-700 text-slate-400"
                    }`}>
                      {done ? <CheckCircle2 size={12} /> : step}
                    </div>
                    <span className={active ? "text-amber-600 dark:text-amber-400 font-semibold" : ""}>{PHASE_LABELS[p]}</span>
                    {idx < 2 && <div className="w-6 h-px bg-slate-200 dark:bg-slate-700" />}
                  </div>
                );
              })}
            </div>

            {/* Progress bar — only during TUS upload phase */}
            {phase === "uploading" && (
              <>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-500">Direct upload to Vimeo</span>
                  <span className="text-amber-600 dark:text-amber-400">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  {mediaFile
                    ? `${((uploadProgress / 100) * mediaFile.size / 1024 / 1024).toFixed(0)} MB / ${(mediaFile.size / 1024 / 1024).toFixed(0)} MB`
                    : ""}
                </p>
              </>
            )}

            {/* Spinner for phases with no numeric progress */}
            {(phase === "creating-session" || phase === "finalizing") && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 size={16} className="animate-spin text-amber-500" />
                <span>{PHASE_LABELS[phase]}</span>
              </div>
            )}
          </div>
        )}

        {/* Footer buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={isVideoUploading ? handleCancelUpload : onCancel}
            className="px-6 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-all"
          >
            {isVideoUploading ? "Cancel Upload" : "Cancel"}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-lg shadow-sm disabled:opacity-60 transition-all flex items-center justify-center gap-2 min-w-[130px]"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading && type === "video"
              ? phase === "creating-session" ? "Preparing…"
              : phase === "uploading" ? `${uploadProgress}%`
              : phase === "finalizing" ? "Finalizing…"
              : "Uploading…"
              : loading ? "Processing…"
              : config[type].btn}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Image Upload Zone ──────────────────────────────────────────────────────────
function ImageUploadZone({ file, preview, onChange, label, disabled }: {
  file: File | null;
  preview: string | null;
  onChange: (file: File | null) => void;
  label: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-yellow-50/20 dark:bg-yellow-500/5 transition-all min-h-[140px] flex items-center justify-center ${disabled ? "pointer-events-none opacity-60" : ""}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        disabled={disabled}
      />
      {preview ? (
        <div className="relative w-full">
          <div className="relative w-full h-48">
            <Image src={preview} alt="Cover preview" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <p className="text-white text-sm font-semibold">Click to change image</p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
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

// ── Video File Upload Zone ─────────────────────────────────────────────────────
function FileUploadZone({ file, onChange, label, accept, disabled }: {
  file: File | null;
  onChange: (file: File | null) => void;
  label: string;
  accept: string;
  disabled?: boolean;
}) {
  return (
    <div className={`relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center bg-yellow-50/20 dark:bg-yellow-500/5 hover:bg-yellow-50/40 transition-all ${disabled ? "pointer-events-none opacity-60" : ""}`}>
      <input
        type="file"
        accept={accept}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        disabled={disabled}
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